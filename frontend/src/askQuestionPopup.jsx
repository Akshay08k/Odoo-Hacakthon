import React, { useState, useRef, useEffect } from "react";
import {
  FaTimes,
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaListOl,
  FaListUl,
  FaSmile,
  FaLink,
  FaImage,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaQuestion,
  FaPlus,
  FaTimes as FaTimesSmall,
} from "react-icons/fa";
import axios from "axios";

export default function AskQuestionPopup({ open, onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: [],
  });
  const [currentTag, setCurrentTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const editorRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setFormData({
        title: "",
        description: "",
        tags: [],
      });
      setCurrentTag("");
      setErrors({});
    }
  }, [open]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleTagAdd = () => {
    if (
      currentTag.trim() &&
      formData.tags.length < 5 &&
      !formData.tags.includes(currentTag.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  const insertLink = () => {
    const url = prompt("Enter the URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const insertImage = () => {
    const url = prompt("Enter the image URL:");
    if (url) {
      execCommand("insertImage", url);
    }
  };

  const handleEditorChange = () => {
    const content = editorRef.current.innerHTML;
    handleInputChange("description", content);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim() || formData.description === "<br>") {
      newErrors.description = "Description is required";
    }

    if (formData.tags.length === 0) {
      newErrors.tags = "At least one tag is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/question/post",
        formData
      );
      console.log(res);
      setIsLoading(false);
      onClose();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/300 backdrop-blur bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center">
            <FaQuestion className="w-6 h-6 mr-3" />
            <h2 className="text-2xl font-bold">Ask a Question</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Question Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your question title"
                maxLength={200}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Description *
              </label>

              <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-3 flex flex-wrap gap-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => execCommand("bold")}
                    className="p-2 rounded hover:bg-gray-200 transition-colors"
                    title="Bold"
                  >
                    <FaBold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execCommand("italic")}
                    className="p-2 rounded hover:bg-gray-200 transition-colors"
                    title="Italic"
                  >
                    <FaItalic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execCommand("strikeThrough")}
                    className="p-2 rounded hover:bg-gray-200 transition-colors"
                    title="Strikethrough"
                  >
                    <FaStrikethrough className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-px bg-gray-300 h-8"></div>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => execCommand("insertOrderedList")}
                    className="p-2 rounded hover:bg-gray-200 transition-colors"
                    title="Numbered List"
                  >
                    <FaListOl className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execCommand("insertUnorderedList")}
                    className="p-2 rounded hover:bg-gray-200 transition-colors"
                    title="Bullet List"
                  >
                    <FaListUl className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-px bg-gray-300 h-8"></div>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => execCommand("justifyLeft")}
                    className="p-2 rounded hover:bg-gray-200 transition-colors"
                    title="Align Left"
                  >
                    <FaAlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execCommand("justifyCenter")}
                    className="p-2 rounded hover:bg-gray-200 transition-colors"
                    title="Align Center"
                  >
                    <FaAlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execCommand("justifyRight")}
                    className="p-2 rounded hover:bg-gray-200 transition-colors"
                    title="Align Right"
                  >
                    <FaAlignRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-px bg-gray-300 h-8"></div>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={insertLink}
                    className="p-2 rounded hover:bg-gray-200 transition-colors"
                    title="Insert Link"
                  >
                    <FaLink className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={insertImage}
                    className="p-2 rounded hover:bg-gray-200 transition-colors"
                    title="Insert Image"
                  >
                    <FaImage className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div
                ref={editorRef}
                contentEditable
                onInput={handleEditorChange}
                className={`min-h-[200px] p-4 border-l border-r border-b border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? "border-red-500" : ""
                }`}
                style={{ lineHeight: "1.6" }}
                placeholder="Describe your question in detail..."
                suppressContentEditableWarning={true}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags * (Maximum 5)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <FaTimesSmall className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  placeholder="Add a tag and press Enter"
                  maxLength={20}
                  disabled={formData.tags.length >= 5}
                />
                <button
                  type="button"
                  onClick={handleTagAdd}
                  disabled={!currentTag.trim() || formData.tags.length >= 5}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <FaPlus className="w-4 h-4" />
                  Add
                </button>
              </div>
              {errors.tags && (
                <p className="text-red-500 text-sm mt-1">{errors.tags}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`px-6 py-2 rounded-lg font-medium text-white transition-all duration-200 ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:transform active:scale-95"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </div>
            ) : (
              "Submit Question"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
