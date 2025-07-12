import React, { useEffect, useState } from "react";
import AskQuestionPopup from "../askQuestionPopup";

const LatestQuestions = () => {
  const [open, setOpen] = useState(false);
  console.log(open)
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 7;

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const changePage = (page) => {
    if (page === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    } else if (page === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    } else if (typeof page === "number") {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    const fetchQuestions = () => {
      setTimeout(() => {
        setQuestions([
          {
            id: 1,
            title:
              "How to join 2 columns in a data set to make a separate column in SQL",
            excerpt:
              "I do not know the code for it as I am a beginner. As an example what I need to do is like there is a column 1 containing First name and column 2 consists of last name I want a column to combine both columns into a single full name column.",
            tags: ["SQL", "Database"],
            answersCount: 5,
            author: "John Doe",
          },
          {
            id: 2,
            title: "How to implement authentication in React application?",
            excerpt:
              "I'm building a React application and need to implement user authentication. What are the best practices for handling login, logout, and protecting routes? Should I use JWT tokens or session-based authentication?",
            tags: ["React", "Authentication"],
            answersCount: 3,
            author: "Jane Smith",
          },
          {
            id: 3,
            title: "Best practices for API error handling in Node.js",
            excerpt:
              "What are the recommended approaches for handling errors in a Node.js REST API? How should I structure error responses and handle different types of errors (validation, database, network, etc.)?",
            tags: ["Node.js", "API"],
            answersCount: 2,
            author: "Mike Johnson",
          },
        ]);
      }, 500);
    };

    fetchQuestions();
  }, [currentPage]);

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col font-sans">
      <AskQuestionPopup open={open} onClose={() => setOpen(false)} />
      <div className="max-w-6xl mx-auto p-5 flex flex-col min-h-screen">
        
        <header className="flex justify-between items-center py-5 border-b-2 border-gray-200 mb-8">
          <a
            href="/"
            className="text-4xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            StackIt
          </a>
          <a
            href="/login"
            className="bg-transparent border-2 border-blue-600 text-blue-600 px-5 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300"
          >
            Login
          </a>
        </header>
        <div className="flex-1 flex flex-col">
          <nav className="flex items-center justify-between bg-white border-2 border-gray-200 rounded-xl p-5 mb-8 shadow-sm">
            <div className="flex items-center gap-5">
              <button
                onClick={() => setOpen(!open)}
                className="bg-gray-100 border-2 border-gray-200 text-gray-900 px-6 py-3 rounded-lg hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300 font-medium"
              >
                Ask New Question
              </button  >

              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="bg-gray-100 border-2 border-gray-200 text-gray-900 px-6 py-3 rounded-lg hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300 font-medium flex items-center gap-2"
                >
                  Browse Questions
                  <svg
                    className={`w-4 h-4 transform transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-10">
                    <a
                      href="/newest-questions"
                      className="w-full text-left px-4 py-3 text-gray-900 hover:bg-blue-600 hover:text-white transition-all duration-300 rounded-t-lg block"
                    >
                      Newest Questions
                    </a>
                    <a
                      href="/unanswered-questions"
                      className="w-full text-left px-4 py-3 text-gray-900 hover:bg-blue-600 hover:text-white transition-all duration-300 rounded-b-lg block"
                    >
                      Unanswered Questions
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="relative max-w-md flex-1 ml-8">
              <form action="/search-results" method="GET" className="flex">
                <input
                  type="text"
                  name="q"
                  className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Search questions..."
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  🔍
                </button>
              </form>
            </div>
          </nav>

          <main className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <h1 className="text-2xl font-bold text-blue-600">
                Latest Questions
              </h1>
              <span className="text-gray-600 text-sm">
                {questions.length} questions
              </span>
            </div>

            <div className="flex flex-col gap-5">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-blue-600 cursor-pointer hover:underline flex-1 mr-5 leading-relaxed">
                      <a href={`/question-detail?id=${question.id}`}>
                        {question.title}
                      </a>
                    </h2>
                    <span className="bg-gray-100 text-gray-900 px-3 py-2 rounded-full text-sm font-bold min-w-[70px] text-center flex-shrink-0">
                      {question.answersCount} ans
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {question.excerpt}
                  </p>
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div className="flex gap-2 flex-wrap">
                      {question.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="bg-gray-100 text-gray-900 px-2 py-1 rounded text-xs border border-gray-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-gray-600 text-sm">
                      Asked by {question.author}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => changePage("prev")}
                className="bg-gray-100 border-2 border-gray-200 text-gray-900 px-3 py-2 rounded hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300"
              >
                ‹
              </button>
              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => changePage(pageNum)}
                    className={`px-3 py-2 rounded border-2 transition-all duration-300 ${
                      pageNum === currentPage
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-gray-100 border-gray-200 text-gray-900 hover:bg-blue-600 hover:border-blue-600 hover:text-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => changePage("next")}
                className="bg-gray-100 border-2 border-gray-200 text-gray-900 px-3 py-2 rounded hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300"
              >
                ›
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LatestQuestions;
