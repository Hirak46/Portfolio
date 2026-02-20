"use client";

import { useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Home,
  RefreshCw,
  Wand2,
  User,
  BookOpen,
  Briefcase,
  Code,
  Image as ImageIcon,
  Settings,
  Brain,
  Trash2,
  X,
  Paperclip,
  Send,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Section =
  | "dashboard"
  | "ai-editor"
  | "profile"
  | "publications"
  | "projects"
  | "images"
  | "cv-upload"
  | "scholar";

interface ChatMessage {
  id: number;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  applied?: boolean;
}

export default function AdminPanel() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentSection, setCurrentSection] = useState<Section>("dashboard");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // AI Editor states
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewAiResponse, setPreviewAiResponse] = useState<string>("");

  // Scholar fetch states
  const [scholarFetching, setScholarFetching] = useState(false);
  const [scholarResult, setScholarResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    changes?: string[];
    stats?: { totalCitations: number; hIndex: number; i10Index: number };
    publicationsFound?: number;
  } | null>(null);

  // Simple password check - change this to your preferred password
  const ADMIN_PASSWORD = "hirak2024admin";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setMessage("");
    } else {
      setMessage("Incorrect password!");
    }
  };

  // Fetch Google Scholar data
  const handleScholarFetch = async () => {
    setScholarFetching(true);
    setScholarResult(null);
    try {
      const response = await fetch("/api/admin/fetch-scholar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
        body: JSON.stringify({
          scholarId: "YEANndoAAAAJ",
          updateProfile: true,
          updatePublications: true,
        }),
      });
      const data = await response.json();
      setScholarResult(data);
    } catch (error) {
      setScholarResult({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch Scholar data",
      });
    } finally {
      setScholarFetching(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (
        selectedFile.type === "application/pdf" ||
        selectedFile.name.endsWith(".tex")
      ) {
        setFile(selectedFile);
        setMessage("");
      } else {
        setMessage("Please upload a PDF or LaTeX file");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first");
      return;
    }

    setUploading(true);
    setMessage("Processing your CV...");

    const formData = new FormData();
    formData.append("cv", file);

    try {
      const response = await fetch("/api/admin/parse-cv", {
        method: "POST",
        body: formData,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ CV processed successfully! Your data has been updated.");
        setFile(null);

        // Reload the page after 2 seconds to show updated data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage(`❌ Error: ${data.error || "Failed to process CV"}`);
      }
    } catch (error) {
      setMessage("❌ Error uploading CV. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // AI Instruction Handler
  const handleAiInstruction = async (applyChanges: boolean = false) => {
    if (!aiInstruction.trim() && uploadedFiles.length === 0) {
      setPreviewAiResponse("Please enter an instruction or upload a file");
      return;
    }

    setAiProcessing(true);
    const userMessage: ChatMessage = {
      id: Date.now(),
      type: "user",
      content: aiInstruction || `Uploaded ${uploadedFiles.length} file(s)`,
      timestamp: new Date(),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setPreviewAiResponse("🤖 AI Agent is analyzing your request...");

    try {
      const formData = new FormData();
      formData.append("instruction", aiInstruction);
      formData.append("applyChanges", String(applyChanges));

      uploadedFiles.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      const response = await fetch("/api/admin/ai-update", {
        method: "POST",
        body: formData,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });

      const data = await response.json();

      if (response.ok) {
        const aiMessage: ChatMessage = {
          id: Date.now() + 1,
          type: "ai",
          content: `${data.message}\n\n📝 Changes:\n${data.changes || "Updated successfully!"}`,
          timestamp: new Date(),
          applied: applyChanges,
        };

        setChatHistory((prev) => [...prev, aiMessage]);
        setPreviewAiResponse(aiMessage.content);

        if (applyChanges) {
          setAiInstruction("");
          setUploadedFiles([]);

          // Reload after 3 seconds
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      } else {
        const errorMessage: ChatMessage = {
          id: Date.now() + 1,
          type: "ai",
          content: `❌ Error: ${data.error || "Failed to process instruction"}`,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, errorMessage]);
        setPreviewAiResponse(errorMessage.content);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: "❌ Error processing instruction. Please try again.",
        timestamp: new Date(),
      };
      setChatHistory((prev) => [...prev, errorMessage]);
      setPreviewAiResponse(errorMessage.content);
    } finally {
      setAiProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter((f) => f.size <= 50 * 1024 * 1024); // 50MB limit
      setUploadedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearChat = () => {
    setChatHistory([]);
    setPreviewAiResponse("");
    setAiInstruction("");
    setUploadedFiles([]);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            Admin Access
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-white mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter admin password"
              />
            </div>
            {message && <p className="text-red-400 text-sm">{message}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Login
            </button>
          </form>
          <p className="text-gray-400 text-sm mt-4 text-center">
            For authorized personnel only
          </p>
        </div>
      </div>
    );
  }

  // Main menu - choose between website and update
  if (currentSection === "dashboard") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 pt-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              AI-Powered Admin Dashboard
            </h1>
            <p className="text-gray-300">
              Just tell the AI what you want - it handles everything
              automatically!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* AI Editor - Primary Feature */}
            <button
              onClick={() => setCurrentSection("ai-editor")}
              className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/50 rounded-2xl p-8 transition-all transform hover:scale-105 group col-span-full"
            >
              <div className="flex items-center justify-center gap-6">
                <div className="bg-purple-500/30 p-6 rounded-full group-hover:bg-purple-500/40 transition-colors">
                  <Brain className="w-16 h-16 text-purple-300" />
                </div>
                <div className="text-left">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    🤖 AI Agent Editor
                  </h2>
                  <p className="text-gray-300 text-lg">
                    Tell AI what to change - No coding needed!
                  </p>
                  <p className="text-purple-300 text-sm mt-2">
                    Example: &ldquo;Update my bio to mention I won an
                    award&rdquo; or &ldquo;Add new publication about AI&rdquo;
                  </p>
                </div>
              </div>
            </button>

            {/* Go to Website */}
            <button
              onClick={() => router.push("/")}
              className="bg-white/10 backdrop-blur-lg hover:bg-white/20 border border-white/20 rounded-2xl p-6 transition-all transform hover:scale-105 group"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-blue-500/20 p-4 rounded-full group-hover:bg-blue-500/30 transition-colors">
                  <Home className="w-10 h-10 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    View Website
                  </h2>
                  <p className="text-gray-300 text-sm">
                    See your live portfolio
                  </p>
                </div>
              </div>
            </button>

            {/* Manual Edit - Section by Section */}
            <button
              onClick={() => router.push("/admin/edit")}
              className="bg-white/10 backdrop-blur-lg hover:bg-white/20 border border-white/20 rounded-2xl p-6 transition-all transform hover:scale-105 group"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-green-500/20 p-4 rounded-full group-hover:bg-green-500/30 transition-colors">
                  <User className="w-10 h-10 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    📝 Manual Edit
                  </h2>
                  <p className="text-gray-300 text-sm">
                    Edit CV section by section
                  </p>
                </div>
              </div>
            </button>

            {/* CV Upload */}
            <button
              onClick={() => setCurrentSection("cv-upload")}
              className="bg-white/10 backdrop-blur-lg hover:bg-white/20 border border-white/20 rounded-2xl p-6 transition-all transform hover:scale-105 group"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-orange-500/20 p-4 rounded-full group-hover:bg-orange-500/30 transition-colors">
                  <Upload className="w-10 h-10 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">
                    Upload CV
                  </h2>
                  <p className="text-gray-300 text-sm">Auto-update from CV</p>
                </div>
              </div>
            </button>

            {/* Google Scholar Sync */}
            <button
              onClick={() => setCurrentSection("scholar")}
              className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-lg hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/50 rounded-2xl p-6 transition-all transform hover:scale-105 group col-span-full"
            >
              <div className="flex items-center justify-center gap-6">
                <div className="bg-cyan-500/30 p-4 rounded-full group-hover:bg-cyan-500/40 transition-colors">
                  <BookOpen className="w-10 h-10 text-cyan-300" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold text-white mb-1">
                    📚 Google Scholar Sync
                  </h2>
                  <p className="text-gray-300 text-sm">
                    Auto-fetch citations, h-index & publications from your
                    Scholar profile
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-red-400 hover:text-red-300 transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // AI Editor Section
  if (currentSection === "ai-editor") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setCurrentSection("dashboard")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Brain className="w-8 h-8 text-purple-400" />
                AI Agent Editor
              </h1>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                Logout
              </button>
            </div>

            <div className="space-y-6">
              {/* Chat History */}
              {chatHistory.length > 0 && (
                <div className="bg-black/30 border border-purple-500/30 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      💬 Chat History ({chatHistory.length} messages)
                    </h3>
                    <button
                      onClick={clearChat}
                      className="flex items-center gap-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 text-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {chatHistory.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${
                          msg.type === "user"
                            ? "bg-blue-500/20 border border-blue-500/30 ml-8"
                            : "bg-purple-500/20 border border-purple-500/30 mr-8"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-xs text-gray-400">
                            {msg.type === "user" ? "👤 You" : "🤖 AI Agent"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <pre className="text-white text-sm whitespace-pre-wrap font-sans">
                          {msg.content}
                        </pre>
                        {msg.applied && (
                          <div className="mt-2 text-xs text-green-400">
                            ✅ Changes Applied
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-6">
                <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  How to Use AI Agent:
                </h2>
                <div className="grid md:grid-cols-2 gap-4 text-gray-300 text-sm">
                  <div>
                    <p className="font-semibold text-purple-300 mb-2">
                      ✨ Example Instructions:
                    </p>
                    <ul className="space-y-1 ml-4">
                      <li>
                        • &ldquo;Update my bio to mention I&apos;m an AI
                        researcher&rdquo;
                      </li>
                      <li>• &ldquo;Add a new publication titled...&rdquo;</li>
                      <li>
                        • &ldquo;Change my email to newmail@example.com&rdquo;
                      </li>
                      <li>
                        • &ldquo;Add Python and TensorFlow to my skills&rdquo;
                      </li>
                      <li>
                        • &ldquo;Update citation count for TumorGANet to
                        50&rdquo;
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-purple-300 mb-2">
                      🎯 What AI Can Do:
                    </p>
                    <ul className="space-y-1 ml-4">
                      <li>• Edit profile information</li>
                      <li>• Add/update publications</li>
                      <li>• Modify skills and experience</li>
                      <li>• Update projects and achievements</li>
                      <li>• Fix errors and formatting</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* AI Input Area */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-white text-lg font-semibold">
                    Tell AI what you want to change:
                  </label>
                  <span className="text-sm text-purple-300">
                    💡 Unlimited chat • Upload files up to 50MB
                  </span>
                </div>

                <textarea
                  value={aiInstruction}
                  onChange={(e) => setAiInstruction(e.target.value)}
                  placeholder="Example: Update my bio to say I have 21 publications with 81 citations and add that I won the Top 10 Student Paper Award at ICEEICT 2024..."
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[150px] resize-y"
                  disabled={aiProcessing}
                />

                {/* File Upload Area */}
                <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-4 hover:border-purple-500/50 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,application/pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="ai-file-upload"
                    disabled={aiProcessing}
                  />
                  <label
                    htmlFor="ai-file-upload"
                    className="flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <Paperclip className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300">
                      Click to upload files or screenshots (Max 50MB each)
                    </span>
                  </label>

                  {/* Uploaded Files */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white/5 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-purple-400" />
                            <div>
                              <p className="text-white text-sm">{file.name}</p>
                              <p className="text-gray-400 text-xs">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Preview Button */}
                  <button
                    onClick={() => handleAiInstruction(false)}
                    disabled={
                      aiProcessing ||
                      (!aiInstruction.trim() && uploadedFiles.length === 0)
                    }
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-4 rounded-lg transition-all flex items-center justify-center gap-2 text-lg"
                  >
                    {aiProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                        AI is thinking...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-6 h-6" />
                        Preview Changes (Don&apos;t Apply)
                      </>
                    )}
                  </button>

                  {/* Apply Button */}
                  <button
                    onClick={() => handleAiInstruction(true)}
                    disabled={
                      aiProcessing ||
                      (!aiInstruction.trim() && uploadedFiles.length === 0)
                    }
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 rounded-lg transition-all flex items-center justify-center gap-2 text-lg"
                  >
                    {aiProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                        Applying...
                      </>
                    ) : (
                      <>
                        <Send className="w-6 h-6" />
                        Apply Changes Now
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* AI Response Preview */}
              {previewAiResponse && (
                <div
                  className={`p-6 rounded-lg ${previewAiResponse.includes("✅") ? "bg-green-500/20 border border-green-500/50" : previewAiResponse.includes("❌") ? "bg-red-500/20 border border-red-500/50" : "bg-blue-500/20 border border-blue-500/50"}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-semibold">
                      Latest Response:
                    </h3>
                    <button
                      onClick={() => setPreviewAiResponse("")}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <pre className="text-white whitespace-pre-wrap font-mono text-sm">
                    {previewAiResponse}
                  </pre>
                </div>
              )}

              {/* Quick Actions - Now at bottom */}
              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">
                  Quick AI Commands:
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    "Update citation count from Google Scholar",
                    "Add my latest publication",
                    "Fix any errors in my data",
                    "Update my research interests",
                  ].map((cmd, i) => (
                    <button
                      key={i}
                      onClick={() => setAiInstruction(cmd)}
                      className="text-left px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 text-gray-300 text-sm transition-all"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Profile Editor Section
  if (currentSection === "profile") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setCurrentSection("dashboard")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                Logout
              </button>
            </div>

            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-6 mb-6">
              <h2 className="text-white font-semibold mb-3">
                💡 Pro Tip: Use AI Editor Instead!
              </h2>
              <p className="text-gray-300 text-sm mb-3">
                Instead of manual editing, just tell the AI what you want to
                change:
              </p>
              <button
                onClick={() => {
                  setCurrentSection("ai-editor");
                  setAiInstruction("Update my profile information: ");
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Open AI Editor
              </button>
            </div>

            <p className="text-gray-400 text-center">
              Manual editing coming soon. For now, use the AI Editor for instant
              updates!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // CV Upload panel
  if (currentSection === "cv-upload") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => {
                  setCurrentSection("dashboard");
                  setFile(null);
                  setMessage("");
                }}
                className="text-gray-300 hover:text-white transition-colors"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-white">
                CV Upload & Auto-Update
              </h1>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                Logout
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  How it works:
                </h2>
                <ul className="text-gray-300 text-sm space-y-1 ml-7">
                  <li>• Upload your CV (PDF or LaTeX format)</li>
                  <li>• AI will extract all information automatically</li>
                  <li>• Your website data will be updated instantly</li>
                  <li>• Publications, projects, and profile info will sync</li>
                </ul>
              </div>

              <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center">
                <Upload className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <input
                  type="file"
                  accept=".pdf,.tex"
                  onChange={handleFileChange}
                  className="hidden"
                  id="cv-upload"
                />
                <label
                  htmlFor="cv-upload"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors"
                >
                  Select CV File
                </label>
                {file && (
                  <p className="text-green-400 mt-4">Selected: {file.name}</p>
                )}
              </div>

              {file && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Upload & Update Website
                    </>
                  )}
                </button>
              )}

              {message && (
                <div
                  className={`p-4 rounded-lg ${message.includes("✅") ? "bg-green-500/20 border border-green-500/50" : "bg-red-500/20 border border-red-500/50"}`}
                >
                  <p className="text-white">{message}</p>
                </div>
              )}

              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Security Note:
                </h3>
                <p className="text-gray-300 text-sm">
                  This admin panel is only accessible to you. Website visitors
                  cannot see or access this page. Your password is stored
                  locally and is not shared with anyone.
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">
                  Current Password:
                </h3>
                <code className="text-blue-400 bg-black/30 px-3 py-1 rounded">
                  {ADMIN_PASSWORD}
                </code>
                <p className="text-gray-400 text-sm mt-2">
                  Change this in:{" "}
                  <code className="text-xs">src/app/admin/page.tsx</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Google Scholar Sync Section
  if (currentSection === "scholar") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900 to-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => {
                  setCurrentSection("dashboard");
                  setScholarResult(null);
                }}
                className="text-gray-300 hover:text-white transition-colors"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-white">
                📚 Google Scholar Sync
              </h1>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                Logout
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-cyan-500/20 border border-cyan-500/50 rounded-lg p-4">
                <h2 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  How it works:
                </h2>
                <ul className="text-gray-300 text-sm space-y-1 ml-7">
                  <li>• Fetches your latest stats from Google Scholar</li>
                  <li>• Updates citation count, h-index, and i10-index</li>
                  <li>• Syncs new publications automatically</li>
                  <li>• Updates citation counts for existing publications</li>
                </ul>
              </div>

              <div className="bg-white/5 rounded-lg p-6 text-center">
                <p className="text-gray-300 mb-2">
                  Your Google Scholar Profile:
                </p>
                <a
                  href="https://scholar.google.com/citations?user=YEANndoAAAAJ&hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline text-sm break-all"
                >
                  https://scholar.google.com/citations?user=YEANndoAAAAJ&hl=en
                </a>
              </div>

              <button
                onClick={handleScholarFetch}
                disabled={scholarFetching}
                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {scholarFetching ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Fetching from Google Scholar...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Fetch & Update from Google Scholar
                  </>
                )}
              </button>

              {scholarResult && (
                <div
                  className={`p-6 rounded-lg ${
                    scholarResult.success
                      ? "bg-green-500/20 border border-green-500/50"
                      : "bg-red-500/20 border border-red-500/50"
                  }`}
                >
                  {scholarResult.success ? (
                    <div className="space-y-3">
                      <p className="text-green-400 font-semibold text-lg">
                        ✅ {scholarResult.message}
                      </p>
                      {scholarResult.stats && (
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div className="bg-white/10 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold text-white">
                              {scholarResult.stats.totalCitations}
                            </p>
                            <p className="text-gray-400 text-sm">Citations</p>
                          </div>
                          <div className="bg-white/10 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold text-white">
                              {scholarResult.stats.hIndex}
                            </p>
                            <p className="text-gray-400 text-sm">h-index</p>
                          </div>
                          <div className="bg-white/10 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold text-white">
                              {scholarResult.stats.i10Index}
                            </p>
                            <p className="text-gray-400 text-sm">i10-index</p>
                          </div>
                        </div>
                      )}
                      {scholarResult.publicationsFound !== undefined && (
                        <p className="text-gray-300 text-sm">
                          📄 {scholarResult.publicationsFound} publications
                          found on Scholar
                        </p>
                      )}
                      {scholarResult.changes &&
                        scholarResult.changes.length > 0 && (
                          <div className="mt-3 space-y-1">
                            <p className="text-white font-semibold">Changes:</p>
                            {scholarResult.changes.map(
                              (change: string, i: number) => (
                                <p key={i} className="text-gray-300 text-sm">
                                  {change}
                                </p>
                              ),
                            )}
                          </div>
                        )}
                    </div>
                  ) : (
                    <p className="text-red-400">
                      ❌ {scholarResult.error || "Failed to fetch data"}
                    </p>
                  )}
                </div>
              )}

              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Note:
                </h3>
                <p className="text-gray-300 text-sm">
                  Google Scholar may rate-limit requests. If fetching fails,
                  wait a few minutes and try again. Your Scholar profile must be
                  public for this to work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default return (should not reach here)
  return null;
}
