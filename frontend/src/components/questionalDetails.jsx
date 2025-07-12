import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, Link, useParams } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../contexts/authContext";

const QuestionDetail = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [answerError, setAnswerError] = useState(null);
  const editorRef = useRef(null);

  // Rich text editor functions
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  const handleEditorInput = () => {
    const content = editorRef.current.innerHTML;
    setAnswerText(content);
  };

  const fetchQuestionDetails = async () => {
    if (!id) {
      setError("Question ID not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const questionResponse = await axios.get(`/api/question/${id}`);
      const answersResponse = await axios.get(`/api/question/${id}/answers`, {
        withCredentials: true,
      });

      setQuestion(questionResponse.data);
      setAnswers(answersResponse.data.answers || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch question details"
      );
      console.error("Error fetching question details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteQuestion = async (voteType) => {
    if (!user) {
      alert("Please login to vote");
      return;
    }

    try {
      const response = await axios.post(
        `/api/question/${id}/${voteType}`,
        {},
        { withCredentials: true }
      );

      setQuestion((prev) => ({
        ...prev,
        upvotes: response.data.upvotes,
        downvotes: response.data.downvotes,
        hasUpvoted: response.data.hasUpvoted,
        hasDownvoted: response.data.hasDownvoted,
      }));
    } catch (err) {
      console.error(`Error ${voteType}voting question:`, err);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();

    if (!answerText.trim()) {
      setAnswerError("Answer cannot be empty");
      return;
    }

    if (!user) {
      setAnswerError("Please login to submit an answer");
      return;
    }

    try {
      setSubmittingAnswer(true);
      setAnswerError(null);

      const response = await axios.post(
        `/api/question/${id}/answer`,
        { content: answerText },
        { withCredentials: true }
      );

      setAnswers((prev) => [response.data, ...prev]);
      setAnswerText("");
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }

      setQuestion((prev) => ({
        ...prev,
        answersCount: (prev.answersCount || 0) + 1,
      }));
    } catch (err) {
      setAnswerError(
        err.response?.data?.message || err.message || "Failed to submit answer"
      );
      console.error("Error submitting answer:", err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleVoteAnswer = async (answerId, voteType) => {
    if (!user) {
      alert("Please login to vote");
      return;
    }

    try {
      await axios.post(
        `/api/question/${id}/answer/vote`,
        { voteType },
        { withCredentials: true }
      );

      setAnswers((prev) =>
        prev.map((answer) =>
          answer.id === answerId
            ? {
                ...answer,
                votes:
                  voteType === "up"
                    ? (answer.votes || 0) + 1
                    : (answer.votes || 0) - 1,
              }
            : answer
        )
      );
    } catch (err) {
      console.error("Error voting on answer:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    fetchQuestionDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600 mb-4"></div>
            <span className="text-gray-600 font-medium ml-4">
              Loading question...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-800 font-medium">Error loading question</p>
            </div>
            <p className="text-red-700 text-sm mb-3">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={fetchQuestionDetails}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-sm"
              >
                Try again
              </button>
              <Link
                to="/"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 text-sm"
              >
                Back to Questions
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 border-b border-gray-200 mb-8 gap-4">
          <Link
            to="/"
            className="text-3xl sm:text-4xl font-bold text-indigo-600 hover:text-indigo-700 transition-all duration-300"
          >
            StackIt
          </Link>

          <div className="flex items-center gap-4">
            {user && user.name ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block">
                  <span className="text-gray-600 text-sm">Welcome,</span>
                  <span className="text-gray-800 font-medium ml-1">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login">
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm">
                  Login
                </button>
              </Link>
            )}
          </div>
        </header>

        <nav className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Questions
          </Link>
        </nav>

        {question && (
          <main className="pb-12">
            <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8 shadow-sm">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4 leading-tight">
                  {question.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Asked by {question.author}
                  </span>
                  {question.createdAt && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {new Date(question.createdAt).toLocaleDateString()}
                      </span>
                    </>
                  )}
                  <span className="text-gray-400">•</span>
                  <span className="bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-full font-medium">
                    {question.answersCount || 0}{" "}
                    {question.answersCount === 1 ? "answer" : "answers"}
                  </span>
                </div>
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {question.content || question.description}
                </p>
              </div>

              {question.tags && question.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {question.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm border border-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
                <h2 className="text-xl font-bold text-indigo-600 mb-4">
                  Your Answer
                </h2>

                <form onSubmit={handleSubmitAnswer}>
                  <div className="mb-4">
                    {/* Rich Text Editor Toolbar */}
                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-t-lg">
                      <button
                        type="button"
                        onClick={() => formatText("bold")}
                        className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                        title="Bold"
                      >
                        <strong>B</strong>
                      </button>
                      <button
                        type="button"
                        onClick={() => formatText("italic")}
                        className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                        title="Italic"
                      >
                        <em>I</em>
                      </button>
                      <button
                        type="button"
                        onClick={() => formatText("underline")}
                        className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                        title="Underline"
                      >
                        <u>U</u>
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <button
                        type="button"
                        onClick={() => formatText("justifyLeft")}
                        className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                        title="Align Left"
                      >
                        ⫷
                      </button>
                      <button
                        type="button"
                        onClick={() => formatText("justifyCenter")}
                        className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                        title="Align Center"
                      >
                        ⫸
                      </button>
                      <button
                        type="button"
                        onClick={() => formatText("justifyRight")}
                        className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                        title="Align Right"
                      >
                        ⫹
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-1"></div>
                      <button
                        type="button"
                        onClick={() => formatText("insertUnorderedList")}
                        className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                        title="Bullet List"
                      >
                        • List
                      </button>
                      <button
                        type="button"
                        onClick={() => formatText("insertOrderedList")}
                        className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                        title="Numbered List"
                      >
                        1. List
                      </button>
                    </div>

                    <div
                      ref={editorRef}
                      contentEditable
                      onInput={handleEditorInput}
                      className="w-full min-h-32 p-4 border border-gray-300 border-t-0 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      style={{ minHeight: "128px" }}
                      placeholder="Write your answer here..."
                      suppressContentEditableWarning={true}
                    />
                  </div>

                  {answerError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{answerError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submittingAnswer || !answerText.trim()}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingAnswer ? "Submitting..." : "Submit Answer"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 mb-8">
                <p className="text-indigo-800 mb-3">
                  Please log in to answer this question.
                </p>
                <Link
                  to="/login"
                  className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200"
                >
                  Login
                </Link>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-indigo-600 mb-6">
                {answers.length === 0
                  ? "No Answers Yet"
                  : answers.length === 1
                  ? "1 Answer"
                  : `${answers.length} Answers`}
              </h2>

              {answers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-lg">
                    Be the first to answer this question!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {answers.map((answer) => (
                    <div
                      key={answer.id}
                      className="border border-gray-200 rounded-lg p-6 bg-gray-50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-2">
                          {console.log(answer)}
                          <button
                            onClick={() => handleVoteAnswer(answer._id, "up")}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-all duration-200"
                            disabled={!user}
                          >
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          </button>
                          <span className="text-indigo-600 font-bold text-lg bg-white px-3 py-1 rounded-full border border-indigo-200">
                            {answer.votes || 0}
                          </span>
                          <button
                            onClick={() => handleVoteAnswer(answer.id, "down")}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                            disabled={!user}
                          >
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="flex-1">
                          <div className="prose max-w-none mb-4">
                            <div
                              className="text-gray-700 leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: answer.content || answer.answer,
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                <span className="font-medium">
                                  {answer.author}
                                </span>
                              </span>
                              {answer.createdAt && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span>
                                    {new Date(
                                      answer.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default QuestionDetail;
