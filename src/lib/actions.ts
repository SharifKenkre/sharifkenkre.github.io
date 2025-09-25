
'use server';

import { collection, getDocs, getDoc, doc, query, where, limit as firestoreLimit, writeBatch, QueryConstraint } from "firebase/firestore";
import { db } from "./firebase";
import type { Question, Passage, Attempt, Paper } from "./types";
import { predictNextYearsPaper, PredictNextYearsPaperInput, PredictNextYearsPaperOutput } from "@/ai/flows/predict-next-years-paper";

export async function getPapersFromFirestore(): Promise<Paper[]> {
    try {
        const papersCol = collection(db, "papers");
        const paperSnapshot = await getDocs(papersCol);
        const paperList: Paper[] = paperSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                paperId: data.paperId,
                title: data.title,
                year: data.year,
                exam: data.exam,
                sections: data.sections || [],
            } as Paper;
        });
        return paperList;
    } catch (error) {
        console.error("Error fetching papers from Firestore:", error);
        return [];
    }
}


export async function getQuestionsFromFirestore(
  difficulty: string,
  count: number,
  section?: string,
  paperId?: string,
  subject?: string,
  questionType?: string,
): Promise<Question[]> {
  try {
    const questionsCol = collection(db, "questions");
    const constraints: QueryConstraint[] = [];

    // Handle multi-select difficulty
    const difficulties = difficulty.split(',').map(d => d.trim()).filter(d => d);
    if (difficulties.length > 0) {
        constraints.push(where("difficulty", "in", difficulties));
    }

    // Handle multi-select sections
    const sections = section?.split(',').map(t => t.trim()).filter(t => t);
    if (sections && sections.length > 0) {
        constraints.push(where("section", "in", sections));
    }
    
    // Handle multi-select questionType
    const questionTypes = questionType?.split(',').map(t => t.trim()).filter(t => t);
    if (questionTypes && questionTypes.length > 0) {
        constraints.push(where("questionType", "in", questionTypes));
    }
    
    if (paperId) {
        constraints.push(where("paperId", "==", paperId));
    }

    if (subject && subject !== 'all') {
        constraints.push(where("subject", "==", subject));
    }
    
    // Only apply limit if not fetching for a specific paper, to ensure we get all questions for that paper
    if (!paperId) {
      constraints.push(firestoreLimit(count * 2)); // Fetch more to shuffle locally
    }

    const q = query(questionsCol, ...constraints);
    
    const questionSnapshot = await getDocs(q);
    let questionsList: Question[] = questionSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        paperId: data.paperId,
        exam: data.exam,
        examType: data.examType,
        year: data.year,
        subject: data.subject,
        section: data.section,
        number: data.number,
        questionType: data.questionType,
        passageId: data.passageId,
        instruction: data.instruction,
        statement: data.statement,
        statements: data.statements,
        bullets: data.bullets,
        options: data.options,
        answer: data.answer,
        marks: data.marks,
        difficulty: data.difficulty,
        imageUrls: data.imageUrls,
        imageAlt: data.imageAlt,
        tags: data.tags || [],
      } as Question;
    });

    const passagePromises = questionsList
      .filter(q => q.passageId)
      .map(q => getDoc(doc(db, "passages", q.passageId!)));
      
    const passageSnapshots = await Promise.all(passagePromises);
    const passages = passageSnapshots.reduce((acc, snap) => {
        if(snap.exists()) {
            acc[snap.id] = snap.data() as Passage;
        }
        return acc;
    }, {} as {[key: string]: Passage});

    questionsList = questionsList.map(q => {
        if (q.passageId && passages[q.passageId]) {
            return { ...q, passageText: passages[q.passageId].text };
        }
        return q;
    });

    // Shuffle the array
    for (let i = questionsList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questionsList[i], questionsList[j]] = [questionsList[j], questionsList[i]];
    }

    return questionsList.slice(0, count);

  } catch (error) {
    console.error("Error fetching questions from Firestore:", error);
    return [];
  }
}

export async function saveAttempts(attempts: Omit<Attempt, 'timestamp'>[]) {
    if (!attempts.length) return;

    const batch = writeBatch(db);
    const attemptsCollection = collection(db, "attempts");

    attempts.forEach(attempt => {
        const docRef = doc(attemptsCollection); // auto-generate ID
        batch.set(docRef, {
            ...attempt,
            timestamp: new Date()
        });
    });

    await batch.commit();
}


export async function getPrediction(input: PredictNextYearsPaperInput): Promise<PredictNextYearsPaperOutput> {
  return await predictNextYearsPaper(input);
}


export async function getAvailableSubjects(paperId?: string): Promise<string[]> {
  try {
    const constraints: QueryConstraint[] = [];
    if (paperId) {
      constraints.push(where("paperId", "==", paperId));
    }
    const q = query(collection(db, "questions"), ...constraints);
    
    const snapshot = await getDocs(q);
    const subjects = new Set<string>();
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.subject) {
        subjects.add(data.subject);
      }
    });
    return Array.from(subjects).sort();
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return [];
  }
}

export async function getAvailableSections(paperId?: string): Promise<string[]> {
  try {
    if (paperId) {
      const papersQuery = query(collection(db, "papers"), where("paperId", "==", paperId));
      const paperSnapshot = await getDocs(papersQuery);
      if (!paperSnapshot.empty) {
        const paperData = paperSnapshot.docs[0].data() as Paper;
        if (paperData.sections && paperData.sections.length > 0) {
          return paperData.sections.sort();
        }
      }
    }
    
    // Fallback to searching all questions if no paperId or no sections on paper
    const constraints: QueryConstraint[] = [];
    if (paperId) {
      constraints.push(where("paperId", "==", paperId));
    }
    const q = query(collection(db, "questions"), ...constraints);
    
    const snapshot = await getDocs(q);
    const sections = new Set<string>();
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.section) {
        sections.add(data.section);
      }
    });
    return Array.from(sections).sort();
  } catch (error) {
    console.error("Error fetching sections:", error);
    return [];
  }
}
