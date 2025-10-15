
'use server';

import { collection, getDocs, getDoc, doc, query, where, limit as firestoreLimit, writeBatch, Query, QueryConstraint, orderBy, collectionGroup, addDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import type { Question, Passage, Paper, QuizAttemptSummary } from "./types";
import { errorEmitter } from "./firebase/error-emitter";
import { FirestorePermissionError } from "./firebase/errors";

export async function getPapersFromFirestore(): Promise<Paper[]> {
    try {
        const papersCol = collection(db, "content_papers");
        const paperSnapshot = await getDocs(papersCol);
        const paperList: Paper[] = paperSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                paperId: data.paperId || doc.id,
                title: data.title || doc.id,
                year: data.year,
                exam: data.exam,
                sections: data.sections || [],
                subjects: data.subjects || [],
                questionTypes: data.questionTypes || [],
                time: data.durationMin, // Use durationMin
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
  paperId?: string,
  subject?: string,
  questionType?: string,
): Promise<Question[]> {
  try {
    if (!paperId) {
      console.error("A paperId is required to fetch questions.");
      return [];
    }

    const questionsColRef = collection(db, `content_papers/${paperId}/questions`);
    let constraints: QueryConstraint[] = [
      orderBy("number", "asc"),
      firestoreLimit(count || 60),
    ];

    if (paperId) {
        // When a paperId is provided, we fetch all its questions up to the limit
        // and ignore other filters, as we are in "exam mode".
    } else {
        const difficulties = difficulty.split(',').map(d => d.trim()).filter(d => d);
        if (difficulties.length > 0 && difficulties.length < 3) {
            constraints.push(where("difficulty", "in", difficulties));
        }
        
        const questionTypes = questionType?.split(',').map(t => t.trim()).filter(t => t);
        if (questionTypes && questionTypes.length > 0) {
            constraints.push(where("questionType", "in", questionTypes));
        }
        
        if (subject && subject !== 'all') {
            constraints.push(where("subject", "==", subject));
        }
    }
    
    const q = query(questionsColRef, ...constraints);
    const questionSnapshot = await getDocs(q);
    
    let questionsList: Question[] = questionSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            number: data.number,
            questionType: data.questionType,
            instruction: data.instruction,
            statement: data.statement,
            texts: data.texts,
            options: data.options,
            answer: data.answer,
            marks: data.marks,
            passageId: data.passageId,
            imageUrls: data.imageUrls,
            imageAlt: data.imageAlt
        } as Question;
    });

    const passageIds = questionsList.map(q => q.passageId).filter((id): id is string => !!id);
    if (passageIds.length > 0) {
        const uniquePassageIds = [...new Set(passageIds)];
        const passagePromises = uniquePassageIds.map(pId => getDoc(doc(db, `content_papers/${paperId}/passages`, pId)));
        
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
    }

    return questionsList;

  } catch (error) {
    console.error("Error fetching questions from Firestore:", error);
    return [];
  }
}

export async function saveAttempt(uid: string, attemptId: string, attemptSummary: Omit<QuizAttemptSummary, 'uid' | 'attemptId' | 'startedAt' | 'lastUpdatedAt'>) {
    if (!uid) return;

    const attemptDocRef = doc(db, `users/${uid}/attempts`, attemptId);
    
    try {
        const docSnap = await getDoc(attemptDocRef);
        const data: Partial<QuizAttemptSummary> = {
            ...attemptSummary,
            lastUpdatedAt: serverTimestamp(),
        };

        if (!docSnap.exists()) {
            data.startedAt = serverTimestamp();
        }

        await setDoc(attemptDocRef, data, { merge: true }).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: attemptDocRef.path,
                operation: 'update',
                requestResourceData: data
            });
            errorEmitter.emit('permission-error', permissionError);
            // Re-throw the original error to be caught by the outer try-catch
            throw serverError;
        });

        const finalDoc = await getDoc(attemptDocRef);
        return finalDoc.data();

    } catch (e) {
        // This will catch the re-thrown error from the setDoc call
        console.error("Failed to save or update attempt:", e);
        // We can choose to re-throw or handle it silently, for now, we log and return null
        return null;
    }
}


export async function getAvailableSubjects(paperId?: string): Promise<string[]> {
  try {
    if (paperId) {
      const paper = await getPaperById(paperId);
      if (paper && paper.subjects && paper.subjects.length > 0) {
        return paper.subjects.sort();
      }
    }
    // Fallback if no paperId is provided - though less efficient.
    const snapshot = await getDocs(collectionGroup(db, 'questions'));
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

export async function getPaperById(paperId: string): Promise<Paper | null> {
    try {
        const paperDocRef = doc(db, "content_papers", paperId);
        const paperDocSnap = await getDoc(paperDocRef);

        if (!paperDocSnap.exists()) {
            console.warn(`No paper found with ID: ${paperId}`);
            return null;
        }

        const data = paperDocSnap.data();
        return {
            id: paperDocSnap.id,
            paperId: data.paperId || paperDocSnap.id,
            title: data.title || paperDocSnap.id,
            year: data.year,
            exam: data.exam,
            durationMin: data.durationMin,
            sections: data.sections || [],
            subjects: data.subjects || [],
            questionTypes: data.questionTypes || [],
            time: data.durationMin,
        } as Paper;
    } catch (error) {
        console.error("Error fetching paper by ID:", error);
        return null;
    }
}

export async function getQuestionsForPaper(paperId: string): Promise<Question[]> {
  try {
    const questionsColRef = collection(db, `content_papers/${paperId}/questions`);
    const q = query(questionsColRef, orderBy("number", "asc"));
    const questionSnapshot = await getDocs(q);
    
    return questionSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id,
            ...data,
        } as Question;
    });
  } catch (error) {
    console.error("Error fetching all questions for paper:", error);
    return [];
  }
}
