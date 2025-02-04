const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { authenticate, authorizeRole } = require('../middleware/auth');
const {Question, Exam , ExamResult} = require("../models/examModel");

// router.post("/add-question", authenticate, async (req, res) => {
//     const { title, questionIds } = req.body;
    
//     if (!title || !questionIds || !Array.isArray(questionIds)) {
//       return res.status(400).json({ error: "Invalid input" });
//     }
  
//     try {
//       const exam = new Exam({ title, questions: questionIds });
//       await exam.save();
//       res.json({ message: "Exam created successfully", exam });
//     } catch (err) {
//      console.log(err)
//      console.log("BAKLAKA")
     
//       res.status(500).json({ error: "Failed to create exam" ,  });
//     }
//   });

  // Fetch exam details
router.get("/:id/get-questions", authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    // Find the exam by ID and populate the questions
    const exam = await Exam.findById(id).populate("questions" , "question , options");
    
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    let response = {
      _id : exam._id,
      isPurchased : false, 
      title : exam.title,
      questions : []
    }
    if(userId ){
      const user = await User.findById(userId);
      // && user.purchasedExams.includes(id)
      if ((user && user.purchasedExams.includes(id)) || user.role === "admin"){
        response.isPurchased = true;
        response.questions = exam.questions;
      }
    }

    res.status(200).json(response); // Send exam details
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch exam details" });
  }
});




// Create a Question
router.post("/create-question", authenticate, async (req, res) => {
    const { question, options, correctAnswer } = req.body;
  
    if (!question || !options || !correctAnswer || options.length < 2) {
      return res.status(400).json({ error: "Invalid input" });
    }
  
    try {
      const newQuestion = new Question({ question, options, correctAnswer });
      await newQuestion.save();
      res.json({ message: "Question created successfully", question: newQuestion });
    } catch (err) {
      res.status(500).json({ error: "Failed to create question" });
    }
  });
  // Create an Exam with Multiple Questions
//   {
//     "title": "Math Exam",
//     "questions": [
//       {
//         "question": "What is 2 + 2?",
//         "options": ["3", "4", "5", "6"],
//         "correctAnswer": "4"
//       },
//       {
//         "question": "What is 5 x 6?",
//         "options": ["25", "30", "35", "40"],
//         "correctAnswer": "30"
//       }
//     ]
//   }
router.post("/create-exam", authenticate, async (req, res) => {
    const { title, questions , price , isFree , duration} = req.body;
    const user = await User.findById(req.user.id).populate('purchasedCourses');
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0 ) {
      return res.status(400).json({ error: "Invalid input" });
    }
  
    try {
      // Create questions
      const createdQuestions = await Question.insertMany(questions);
  
      // Get the IDs of the created questions
      const questionIds = createdQuestions.map(q => q._id);
  
      // Create the exam
      const exam = new Exam({ title, questions: questionIds ,isFree : isFree , price : price , teacher : user , duration : duration });
      await exam.save();
  
      res.json({ message: "Exam created successfully", exam });
    } catch (err) {
        console.log(err)
     console.log("BAKLAKA")
      res.status(500).json({ error: "Failed to create exam" });
    }
  });
  
  router.get("/all-exams",async (req,res )=>{
    try{
    const exams = await Exam.find().select('title price isFree teacher').populate({ path: 'teacher', select: 'name' });

    return res.status(200).json(exams);
    }
    catch(e){
      res.status(500).json({ message: err.message });
    }


  });


  router.post("/submit", authenticate, async (req, res) => {
    const { examId, answers } = req.body;
    let score = 0;
    let correctAnswer = 0;
    let wrongAnswer = 0;
    let attemptedQuestions = 0;
    let skippedQuestions = 0;
    let maxScore = 0;

    try {
        // Fetch the exam along with the teacher (who created it)
        const exam = await Exam.findById(examId).populate("questions teacher");

        if (!exam) {
            return res.status(404).json({ error: "Exam not found" });
        }

        // Fetch the user and check if they have purchased the course
        const user = await User.findById(req.user.id).populate("purchasedCourses");

        // Check if the user is an admin, teacher, or has purchased the exam
        const hasAccess =
            user.role === "admin" ||  
            user.purchasedCourses.some(course => String(course) === String(examId));

        if (!hasAccess) {
            return res.status(403).json({ message: "You must purchase this course to submit the exam" });
        }

        // Evaluate answers
        for (let answer of answers) {
            const question = exam.questions.find(q => q._id.toString() === answer.questionId);
            if (question) {
                maxScore += 4;
                if (answer.selectedAnswer !== null) {  
                    attemptedQuestions++;
                    if (question.correctAnswer === answer.selectedAnswer) {  
                        score += 4;
                        correctAnswer++;
                    } else {
                        score -= 1;
                        wrongAnswer++;
                    }
                } else {
                    skippedQuestions++;
                }
            }
        }

        // Save exam result
        const examResult = new ExamResult({ userId: req.user.id, examId, score });
        await examResult.save();

        res.json({ 
            message: "Exam submitted", 
            maxScore,
            score, 
            correctAnswer, 
            wrongAnswer, 
            attemptedQuestions, 
            skippedQuestions 
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to submit exam" });
    }
});


  router.get("/exam-results", authenticate, async (req, res) => {
    const results = await ExamResult.find({ userId: req.user.id }).populate("examId");
    res.json(results);
  });
  module.exports = router;