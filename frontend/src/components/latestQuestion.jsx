import React, { useEffect, useState } from "react";
import AskQuestionPopup from "../askQuestionPopup";
import axios from "../api/axios";
import { useAuth } from "../contexts/authContext";

const LatestQuestions = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const questionsPerPage = 10;

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

  const fetchQuestions = async (page = 1, search = "", filter = "all") => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: questionsPerPage.toString(),
        ...(search && { search }),
        ...(filter !== "all" && { filter }),
      });

      const response = await axios.get("/api/question", {
        withCredentials: true,
      });

      const data = response.data;

      setQuestions(data.questions || []);
      setTotalPages(data.totalPages || 1);
      setTotalQuestions(data.totalQuestions || 0);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching questions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(currentPage, searchQuery, filterType);
  }, [currentPage, searchQuery, filterType]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchQuestions(1, searchQuery, filterType);
  };

  const handleFilterChange = (newFilter) => {
    setFilterType(newFilter);
    setCurrentPage(1);
    setDropdownOpen(false);
    fetchQuestions(1, searchQuery, newFilter);
  };

  const handleLogout = async () => {
    const res = await axios.post("/api/auth/logout");
    console.log(res);
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center items-center gap-1 sm:gap-2 mt-8 flex-wrap">
        <button
          onClick={() => changePage("prev")}
          disabled={currentPage === 1}
          className="min-w-[40px] h-10 flex items-center justify-center bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => changePage(1)}
              className="min-w-[40px] h-10 flex items-center justify-center bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 text-gray-400">...</span>}
          </>
        )}

        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => changePage(pageNum)}
            className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg border transition-all duration-200 shadow-sm ${
              pageNum === currentPage
                ? "bg-blue-600 border-blue-600 text-white shadow-blue-200"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            }`}
          >
            {pageNum}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="px-2 text-gray-400">...</span>
            )}
            <button
              onClick={() => changePage(totalPages)}
              className="min-w-[40px] h-10 flex items-center justify-center bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => changePage("next")}
          disabled={currentPage === totalPages}
          className="min-w-[40px] h-10 flex items-center justify-center bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <AskQuestionPopup open={open} onClose={() => setOpen(false)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 border-b border-gray-200 mb-8 gap-4">
          <a
            href="/"
            className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
            StackIt
          </a>

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
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm">
                  Login
                </button>
              </Link>
            )}
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
            {/* Left side - Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={() => setOpen(!open)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
              >
                <span className="hidden sm:inline">Ask New Question</span>
                <span className="sm:hidden">Ask Question</span>
              </button>

              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 hover:border-gray-400 transition-all duration-200 font-medium flex items-center justify-between gap-2 min-w-[180px]"
                >
                  <span className="truncate">
                    {filterType === "all"
                      ? "All Questions"
                      : filterType === "newest"
                      ? "Newest"
                      : "Unanswered"}
                  </span>
                  <svg
                    className={`w-5 h-5 transform transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
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

                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full sm:w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                    <button
                      onClick={() => handleFilterChange("all")}
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                    >
                      All Questions
                    </button>
                    <button
                      onClick={() => handleFilterChange("newest")}
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                    >
                      Newest Questions
                    </button>
                    <button
                      onClick={() => handleFilterChange("unanswered")}
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200"
                    >
                      Unanswered Questions
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 lg:max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch(e);
                    }
                  }}
                  className="w-full pl-5 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Search questions..."
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="pb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              {filterType === "all"
                ? "Latest Questions"
                : filterType === "newest"
                ? "Newest Questions"
                : "Unanswered Questions"}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">
                {totalQuestions} question{totalQuestions !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {loading && (
            <div className="flex flex-col justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
              <span className="text-gray-600 font-medium">
                Loading questions...
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
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
                <p className="text-red-800 font-medium">
                  Error loading questions
                </p>
              </div>
              <p className="text-red-700 text-sm mb-3">{error}</p>
              <button
                onClick={() =>
                  fetchQuestions(currentPage, searchQuery, filterType)
                }
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-sm"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {questions.length === 0 ? (
                <div className="text-center py-16">
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
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-lg font-medium mb-2">
                    No questions found
                  </p>
                  {searchQuery && (
                    <p className="text-gray-500 text-sm">
                      Try adjusting your search terms or browse all questions.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question) => (
                    <div
                      key={question.id}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 group"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                        <h2 className="text-xl font-semibold text-gray-800 hover:text-blue-600 cursor-pointer flex-1 leading-relaxed group-hover:text-blue-600 transition-colors duration-200">
                          <a
                            href={`/question/${question._id}`}
                            className="hover:underline"
                          >
                            {question.title}
                          </a>
                        </h2>
                        {console.log(question)}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                            {question.answersCount || 0}{" "}
                            {question.answersCount === 1 ? "answer" : "answers"}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                        {question.excerpt}
                      </p>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex gap-2 flex-wrap">
                          {question.tags &&
                            question.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm border border-gray-200 hover:bg-gray-200 transition-colors duration-200"
                              >
                                {tag}
                              </span>
                            ))}
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm text-gray-500">
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
                            {question.author}
                          </span>
                          {question.createdAt && (
                            <>
                              <span className="hidden sm:inline text-gray-400">
                                •
                              </span>
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
                                {new Date(
                                  question.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {totalPages > 1 && renderPagination()}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default LatestQuestions;
