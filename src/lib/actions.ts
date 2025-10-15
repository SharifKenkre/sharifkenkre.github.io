
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
  paperIds?: string[], // Changed from paperId to paperIds
  subject?: string,
  questionType?: string,
): Promise<Question[]> {
  try {
    let questionsList: Question[] = [];
    const questionsToFetch = count || 10;

    if (paperIds && paperIds.length > 0) {
      // Fetch from specific papers
      for (const paperId of paperIds) {
        const questionsColRef = collection(db, `content_papers/${paperId}/questions`);
        let constraints: QueryConstraint[] = [];
        
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

        const q = query(questionsColRef, ...constraints);
        const questionSnapshot = await getDocs(q);
        const paperQuestions = questionSnapshot.docs.map(doc => {
            const data = doc.data();
            return { id: doc.id, ...data, paperId } as Question;
        });
        questionsList.push(...paperQuestions);
      }
    } else {
        // Fallback to fetching from all papers if none are specified
        const questionsColRef = collectionGroup(db, `questions`);
        // This part would be inefficient at scale and should be used with caution
        // For now, it will fetch from all available questions across all papers
        const q = query(questionsColRef, firestoreLimit(500)); // Limit to avoid huge reads
        const questionSnapshot = await getDocs(q);
        const allQuestions = questionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
        questionsList.push(...allQuestions);
    }
    
    // Shuffle the collected questions
    for (let i = questionsList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questionsList[i], questionsList[j]] = [questionsList[j], questionsList[i]];
    }

    // Apply limit and populate passages
    const limitedQuestions = questionsList.slice(0, questionsToFetch).map((q, i) => ({ ...q, number: i + 1 }));

    const passageIds = limitedQuestions.map(q => ({ passageId: q.passageId, paperId: q.paperId })).filter(p => p.passageId && p.paperId);
    if (passageIds.length > 0) {
        const uniquePassageRefs = [...new Map(passageIds.map(p => [`${p.paperId}-${p.passageId}`, p])).values()];
        const passagePromises = uniquePassageRefs.map(p => getDoc(doc(db, `content_papers/${p.paperId}/passages`, p.passageId!)));
        
        const passageSnapshots = await Promise.all(passagePromises);
        const passages = passageSnapshots.reduce((acc, snap) => {
            if(snap.exists()) {
                acc[snap.id] = snap.data() as Passage;
            }
            return acc;
        }, {} as {[key: string]: Passage});

        return limitedQuestions.map(q => {
            if (q.passageId && passages[q.passageId]) {
                return { ...q, passageText: passages[q.passageId].text };
            }
            return q;
        });
    }

    return limitedQuestions;

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
            throw serverError;
        });

        const finalDoc = await getDoc(attemptDocRef);
        return finalDoc.data();

    } catch (e) {
        console.error("Failed to save or update attempt:", e);
        return null;
    }
}


export async function getAvailableSubjects(paperIds?: string[]): Promise<string[]> {
  try {
    const subjects = new Set<string>();
    if (paperIds && paperIds.length > 0) {
      for (const paperId of paperIds) {
        const paper = await getPaperById(paperId);
        if (paper && paper.subjects && paper.subjects.length > 0) {
          paper.subjects.forEach(s => subjects.add(s));
        }
      }
    } else {
      // Fallback if no paperId is provided
      const snapshot = await getDocs(collectionGroup(db, 'questions'));
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.subject) {
          subjects.add(data.subject);
        }
      });
    }
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
