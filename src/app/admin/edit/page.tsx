"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, ArrowLeft, RefreshCw, Upload, FileText, Image as ImageIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileData {
  name: string;
  title: string;
  tagline: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  interests: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    description: string;
  }>;
  social: {
    scholar: string;
    github: string;
    linkedin: string;
    orcid: string;
    researchgate: string;
  };
  skills: {
    languages: string[];
    programming: string[];
    platforms: string[];
    tools: string[];
    documentation: string[];
    soft: string[];
  };
  workExperience: Array<{
    position: string;
    organization: string;
    location: string;
    period: string;
    description: string;
    email?: string;
  }>;
  awards?: Array<{
    title: string;
    event: string;
    date: string;
    paperId?: string;
  }>;
  reviewExperience?: {
    journals: string[];
    conferences: Array<{
      name: string;
      fullName: string;
      date: string;
      location: string;
      publisher: string;
      role: string;
    }>;
  };
  memberships?: Array<{
    organization: string;
    period: string;
    type: string;
  }>;
  certifications?: string[];
  volunteer?: string[];
  references?: Array<{
    name: string;
    position: string;
    department: string;
    institution: string;
    location: string;
    email: string;
    url?: string;
  }>;
  photo?: string;
  aboutPhoto?: string;
  cvPath?: string;
  stats?: {
    publications: number;
    citations: number;
    hIndex: number;
    i10Index: number;
  };
  scholarStats?: {
    totalCitations: number;
    citationsSince2021: number;
    hIndex: number;
    i10Index: number;
    lastUpdated: string;
  };
}

interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  citations: number;
  pdf: string;
  doi: string;
  abstract: string;
  type: string;
  impactFactor?: string;
  location?: string;
  award?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  github: string;
  demo: string | null;
  image: string;
  featured: boolean;
  date: string;
}

type Section =
  | "home"
  | "profile"
  | "education"
  | "experience"
  | "skills"
  | "publications"
  | "projects"
  | "social"
  | "awards"
  | "reviews"
  | "memberships"
  | "certifications"
  | "volunteer"
  | "references"
  | "files";

export default function AdminEditPanel() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState<Section>("home");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Use API route to get fresh data (avoids browser/CDN caching)
      const response = await fetch("/api/admin/get-data", {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch data");
      }

      setProfileData(data.profile);
      setPublications(data.publications || []);
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage("Error loading data - using defaults");
      // Set default data if fetch fails
      setProfileData({
        name: "",
        title: "",
        tagline: "",
        email: "",
        phone: "",
        location: "",
        bio: "",
        interests: [],
        education: [],
        social: {
          scholar: "",
          github: "",
          linkedin: "",
          orcid: "",
          researchgate: "",
        },
        skills: {
          languages: [],
          programming: [],
          platforms: [],
          tools: [],
          documentation: [],
          soft: [],
        },
        workExperience: [],
      } as any);
      setPublications([]);
      setProjects([]);
    }
    setLoading(false);
  };

  const handlePreview = () => {
    setShowPreview(true);
    setMessage("📋 Preview mode - Review your changes before saving");
  };

  const saveData = async () => {
    setSaving(true);
    setMessage("");
    setShowPreview(false);
    try {
      const response = await fetch("/api/admin/save-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          profile: profileData,
          publications,
          projects,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage(
          `✅ ${result.message || "Data saved successfully! Your website has been updated."}`,
        );
        // Re-fetch data to show updated content without full page reload
        setTimeout(async () => {
          await fetchData();
          setMessage("✅ Data saved and refreshed successfully!");
          setTimeout(() => setMessage(""), 3000);
        }, 1000);
      } else {
        setMessage(`❌ Error: ${result.error || "Failed to save data"}`);
      }
    } catch (error: unknown) {
      console.error("Error saving data:", error);
      const errMsg = error instanceof Error ? error.message : String(error);
      setMessage(`❌ Error saving data: ${errMsg}`);
    }
    setSaving(false);
  };

  if (loading || !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push("/admin")}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
            <div className="flex gap-3">
              {!showPreview ? (
                <button
                  onClick={handlePreview}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  <RefreshCw className="w-5 h-5" />
                  Preview Changes
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="flex items-center gap-2 bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Back to Edit
                  </button>
                  <button
                    onClick={saveData}
                    disabled={saving}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? "Saving..." : "Confirm & Update Website"}
                  </button>
                </>
              )}
            </div>
          </div>
          {message && (
            <div
              className={`p-3 rounded-lg ${message.includes("✅") ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : message.includes("📋") ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}
            >
              {message}
            </div>
          )}
        </div>

        {/* Section Navigation */}
        {!showPreview && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {[
                { id: "home", label: "🏠 Home / Stats" },
                { id: "profile", label: "Profile Info" },
                { id: "education", label: "Education" },
                { id: "experience", label: "Work Experience" },
                { id: "skills", label: "Skills" },
                { id: "social", label: "Social Links" },
                { id: "awards", label: "Honors & Awards" },
                { id: "reviews", label: "Review Experience" },
                { id: "memberships", label: "Memberships" },
                { id: "certifications", label: "Certifications" },
                { id: "volunteer", label: "Volunteer" },
                { id: "references", label: "References" },
                { id: "publications", label: "Publications" },
                { id: "projects", label: "Projects" },
                { id: "files", label: "📁 Photos & CV" },
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.id as Section)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    currentSection === section.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {showPreview ? (
            <PreviewSection
              profileData={profileData}
              publications={publications}
              projects={projects}
              currentSection={currentSection}
            />
          ) : (
            <>
              {currentSection === "home" && (
                <HomeSection data={profileData} setData={setProfileData} />
              )}
              {currentSection === "profile" && (
                <ProfileSection data={profileData} setData={setProfileData} />
              )}
              {currentSection === "education" && (
                <EducationSection data={profileData} setData={setProfileData} />
              )}
              {currentSection === "experience" && (
                <ExperienceSection
                  data={profileData}
                  setData={setProfileData}
                />
              )}
              {currentSection === "skills" && (
                <SkillsSection data={profileData} setData={setProfileData} />
              )}
              {currentSection === "social" && (
                <SocialSection data={profileData} setData={setProfileData} />
              )}
              {currentSection === "awards" && (
                <AwardsSection data={profileData} setData={setProfileData} />
              )}
              {currentSection === "reviews" && (
                <ReviewsSection data={profileData} setData={setProfileData} />
              )}
              {currentSection === "memberships" && (
                <MembershipsSection
                  data={profileData}
                  setData={setProfileData}
                />
              )}
              {currentSection === "certifications" && (
                <CertificationsSection
                  data={profileData}
                  setData={setProfileData}
                />
              )}
              {currentSection === "volunteer" && (
                <VolunteerSection data={profileData} setData={setProfileData} />
              )}
              {currentSection === "references" && (
                <ReferencesSection
                  data={profileData}
                  setData={setProfileData}
                />
              )}
              {currentSection === "publications" && (
                <PublicationsSection
                  data={publications}
                  setData={setPublications}
                />
              )}
              {currentSection === "projects" && (
                <ProjectsSection data={projects} setData={setProjects} />
              )}
              {currentSection === "files" && (
                <FilesSection data={profileData} setData={setProfileData} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Home / Stats Section Component
function HomeSection({
  data,
  setData,
}: {
  data: ProfileData;
  setData: (data: ProfileData) => void;
}) {
  const updateStats = (field: string, value: number) => {
    const currentStats = data.stats || {
      publications: 0,
      citations: 0,
      hIndex: 0,
      i10Index: 0,
    };
    const currentScholarStats = data.scholarStats || {
      totalCitations: 0,
      citationsSince2021: 0,
      hIndex: 0,
      i10Index: 0,
      lastUpdated: new Date().toISOString().split("T")[0],
    };
    setData({
      ...data,
      stats: { ...currentStats, [field]: value },
      scholarStats: {
        ...currentScholarStats,
        [field === "citations" ? "totalCitations" : field]: value,
        lastUpdated: new Date().toISOString().split("T")[0],
      },
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        {"\ud83c\udfe0"} Home Page / Stats Customization
      </h2>

      {/* Photo URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Profile Photo Path
        </label>
        <input
          type="text"
          value={data.photo || "/Hirak.jpg"}
          onChange={(e) => setData({ ...data, photo: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="/Hirak.jpg"
        />
        <p className="text-xs text-gray-500 mt-1">
          Image must be in public/ folder (e.g., /Hirak.jpg)
        </p>
      </div>

      {/* Stats */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          {"\ud83d\udcca"} Statistics (shown on homepage)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Publications
            </label>
            <input
              type="number"
              value={data.stats?.publications || 0}
              onChange={(e) =>
                updateStats("publications", parseInt(e.target.value) || 0)
              }
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Citations
            </label>
            <input
              type="number"
              value={data.stats?.citations || 0}
              onChange={(e) =>
                updateStats("citations", parseInt(e.target.value) || 0)
              }
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              h-index
            </label>
            <input
              type="number"
              value={data.stats?.hIndex || 0}
              onChange={(e) =>
                updateStats("hIndex", parseInt(e.target.value) || 0)
              }
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              i10-index
            </label>
            <input
              type="number"
              value={data.stats?.i10Index || 0}
              onChange={(e) =>
                updateStats("i10Index", parseInt(e.target.value) || 0)
              }
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Scholar Stats */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          {"\ud83c\udf93"} Google Scholar Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Citations
            </label>
            <input
              type="number"
              value={data.scholarStats?.totalCitations || 0}
              onChange={(e) =>
                setData({
                  ...data,
                  scholarStats: {
                    ...data.scholarStats!,
                    totalCitations: parseInt(e.target.value) || 0,
                    lastUpdated: new Date().toISOString().split("T")[0],
                  },
                })
              }
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Citations Since 2021
            </label>
            <input
              type="number"
              value={data.scholarStats?.citationsSince2021 || 0}
              onChange={(e) =>
                setData({
                  ...data,
                  scholarStats: {
                    ...data.scholarStats!,
                    citationsSince2021: parseInt(e.target.value) || 0,
                    lastUpdated: new Date().toISOString().split("T")[0],
                  },
                })
              }
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Updated
            </label>
            <input
              type="date"
              value={data.scholarStats?.lastUpdated || ""}
              onChange={(e) =>
                setData({
                  ...data,
                  scholarStats: {
                    ...data.scholarStats!,
                    lastUpdated: e.target.value,
                  },
                })
              }
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* CV Download Info */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          {"\ud83d\udcc4"} CV / Resume & Photos
        </h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200 mb-2">
            <strong>Manage your photos and CV:</strong> Go to the{" "}
            <code className="bg-blue-200 dark:bg-blue-800 px-1 rounded">
              📁 Photos &amp; CV
            </code>{" "}
            tab to upload, delete, or change your photos and CV.
          </p>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Current CV path:{" "}
            <code className="bg-blue-200 dark:bg-blue-800 px-1 rounded">
              {data.cvPath || "/cv/Hirak.pdf"}
            </code>
            {" | "}
            Homepage photo:{" "}
            <code className="bg-blue-200 dark:bg-blue-800 px-1 rounded">
              {data.photo || "/Hirak.jpg"}
            </code>
            {" | "}
            About photo:{" "}
            <code className="bg-blue-200 dark:bg-blue-800 px-1 rounded">
              {data.aboutPhoto || "/Abou.jpg"}
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}

// Profile Section Component
function ProfileSection({
  data,
  setData,
}: {
  data: ProfileData;
  setData: (data: ProfileData) => void;
}) {
  const updateField = (field: keyof ProfileData, value: any) => {
    setData({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Profile Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Professional Title
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => updateField("location", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tagline
          </label>
          <textarea
            value={data.tagline}
            onChange={(e) => updateField("tagline", e.target.value)}
            rows={2}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            value={data.bio}
            onChange={(e) => updateField("bio", e.target.value)}
            rows={6}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Research Interests (comma-separated)
          </label>
          <textarea
            value={data.interests.join(", ")}
            onChange={(e) =>
              updateField(
                "interests",
                e.target.value.split(",").map((s) => s.trim()),
              )
            }
            rows={3}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Machine Learning, AI, Computer Vision, etc."
          />
        </div>
      </div>
    </div>
  );
}

// Education Section Component
function EducationSection({
  data,
  setData,
}: {
  data: ProfileData;
  setData: (data: ProfileData) => void;
}) {
  const addEducation = () => {
    setData({
      ...data,
      education: [
        ...data.education,
        { degree: "", institution: "", year: "", description: "" },
      ],
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...data.education];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, education: updated });
  };

  const removeEducation = (index: number) => {
    setData({
      ...data,
      education: data.education.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Education
        </h2>
        <button
          onClick={addEducation}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Education
        </button>
      </div>

      {data.education.map((edu, index) => (
        <div
          key={index}
          className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg space-y-4"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Education #{index + 1}
            </h3>
            <button
              onClick={() => removeEducation(index)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Degree
              </label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) =>
                  updateEducation(index, "degree", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., M.Sc. in Computer Science"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Institution
              </label>
              <input
                type="text"
                value={edu.institution}
                onChange={(e) =>
                  updateEducation(index, "institution", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., Stanford University"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year/Period
              </label>
              <input
                type="text"
                value={edu.year}
                onChange={(e) => updateEducation(index, "year", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., 2020 - 2024"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={edu.description}
                onChange={(e) =>
                  updateEducation(index, "description", e.target.value)
                }
                rows={3}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="CGPA, courses, achievements, etc."
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Work Experience Section Component
function ExperienceSection({
  data,
  setData,
}: {
  data: ProfileData;
  setData: (data: ProfileData) => void;
}) {
  const addExperience = () => {
    setData({
      ...data,
      workExperience: [
        ...data.workExperience,
        {
          position: "",
          organization: "",
          location: "",
          period: "",
          description: "",
        },
      ],
    });
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const updated = [...data.workExperience];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, workExperience: updated });
  };

  const removeExperience = (index: number) => {
    setData({
      ...data,
      workExperience: data.workExperience.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Work Experience
        </h2>
        <button
          onClick={addExperience}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Experience
        </button>
      </div>

      {data.workExperience.map((exp, index) => (
        <div
          key={index}
          className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg space-y-4"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Experience #{index + 1}
            </h3>
            <button
              onClick={() => removeExperience(index)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Position
              </label>
              <input
                type="text"
                value={exp.position}
                onChange={(e) =>
                  updateExperience(index, "position", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., Research Assistant"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organization
              </label>
              <input
                type="text"
                value={exp.organization}
                onChange={(e) =>
                  updateExperience(index, "organization", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., Google Research"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={exp.location}
                onChange={(e) =>
                  updateExperience(index, "location", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., New York, USA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Period
              </label>
              <input
                type="text"
                value={exp.period}
                onChange={(e) =>
                  updateExperience(index, "period", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., Jan 2023 - Present"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={exp.description}
                onChange={(e) =>
                  updateExperience(index, "description", e.target.value)
                }
                rows={3}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Describe your responsibilities and achievements"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Skills Section Component
function SkillsSection({
  data,
  setData,
}: {
  data: ProfileData;
  setData: (data: ProfileData) => void;
}) {
  const updateSkillCategory = (
    category: keyof typeof data.skills,
    value: string,
  ) => {
    setData({
      ...data,
      skills: {
        ...data.skills,
        [category]: value
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
      },
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Skills
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Languages (comma-separated)
          </label>
          <input
            type="text"
            value={data.skills.languages.join(", ")}
            onChange={(e) => updateSkillCategory("languages", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="English (Fluent), Spanish (Intermediate)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Programming Languages (comma-separated)
          </label>
          <input
            type="text"
            value={data.skills.programming.join(", ")}
            onChange={(e) => updateSkillCategory("programming", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Python, JavaScript, Java, C++"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Platforms (comma-separated)
          </label>
          <input
            type="text"
            value={data.skills.platforms.join(", ")}
            onChange={(e) => updateSkillCategory("platforms", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Linux, Windows, AWS, Docker"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tools (comma-separated)
          </label>
          <input
            type="text"
            value={data.skills.tools.join(", ")}
            onChange={(e) => updateSkillCategory("tools", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Git, VS Code, Jupyter"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Documentation Tools (comma-separated)
          </label>
          <input
            type="text"
            value={data.skills.documentation.join(", ")}
            onChange={(e) =>
              updateSkillCategory("documentation", e.target.value)
            }
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="LaTeX, Markdown, MS Office"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Soft Skills (comma-separated)
          </label>
          <input
            type="text"
            value={data.skills.soft.join(", ")}
            onChange={(e) => updateSkillCategory("soft", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Leadership, Communication, Teamwork"
          />
        </div>
      </div>
    </div>
  );
}

// Social Links Section Component
function SocialSection({
  data,
  setData,
}: {
  data: ProfileData;
  setData: (data: ProfileData) => void;
}) {
  const updateSocial = (platform: keyof typeof data.social, value: string) => {
    setData({
      ...data,
      social: { ...data.social, [platform]: value },
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Social Links
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Google Scholar
          </label>
          <input
            type="url"
            value={data.social.scholar}
            onChange={(e) => updateSocial("scholar", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="https://scholar.google.com/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            GitHub
          </label>
          <input
            type="url"
            value={data.social.github}
            onChange={(e) => updateSocial("github", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="https://github.com/username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            LinkedIn
          </label>
          <input
            type="url"
            value={data.social.linkedin}
            onChange={(e) => updateSocial("linkedin", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="https://linkedin.com/in/username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ORCID
          </label>
          <input
            type="url"
            value={data.social.orcid}
            onChange={(e) => updateSocial("orcid", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="https://orcid.org/..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ResearchGate
          </label>
          <input
            type="url"
            value={data.social.researchgate}
            onChange={(e) => updateSocial("researchgate", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="https://researchgate.net/profile/..."
          />
        </div>
      </div>
    </div>
  );
}

// Publications Section Component
function PublicationsSection({
  data,
  setData,
}: {
  data: Publication[];
  setData: (data: Publication[]) => void;
}) {
  const addPublication = () => {
    const newPub: Publication = {
      id: String(data.length + 1),
      title: "",
      authors: [],
      venue: "",
      year: new Date().getFullYear(),
      citations: 0,
      pdf: "",
      doi: "",
      abstract: "",
      type: "conference",
    };
    setData([...data, newPub]);
  };

  const updatePublication = (
    index: number,
    field: keyof Publication,
    value: any,
  ) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    setData(updated);
  };

  const removePublication = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Publications
        </h2>
        <button
          onClick={addPublication}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Publication
        </button>
      </div>

      {data.map((pub, index) => (
        <div
          key={pub.id}
          className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg space-y-4"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Publication #{index + 1}
            </h3>
            <button
              onClick={() => removePublication(index)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={pub.title}
                onChange={(e) =>
                  updatePublication(index, "title", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Authors (comma-separated)
              </label>
              <input
                type="text"
                value={pub.authors.join(", ")}
                onChange={(e) =>
                  updatePublication(
                    index,
                    "authors",
                    e.target.value.split(",").map((s) => s.trim()),
                  )
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Venue
              </label>
              <input
                type="text"
                value={pub.venue}
                onChange={(e) =>
                  updatePublication(index, "venue", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year
              </label>
              <input
                type="number"
                value={pub.year}
                onChange={(e) =>
                  updatePublication(index, "year", parseInt(e.target.value))
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={pub.type}
                onChange={(e) =>
                  updatePublication(index, "type", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="journal">Journal</option>
                <option value="conference">Conference</option>
                <option value="book-chapter">Book Chapter</option>
                <option value="preprint">Preprint</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Citations
              </label>
              <input
                type="number"
                value={pub.citations}
                onChange={(e) =>
                  updatePublication(
                    index,
                    "citations",
                    parseInt(e.target.value),
                  )
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                PDF Link
              </label>
              <input
                type="url"
                value={pub.pdf}
                onChange={(e) =>
                  updatePublication(index, "pdf", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                DOI
              </label>
              <input
                type="text"
                value={pub.doi}
                onChange={(e) =>
                  updatePublication(index, "doi", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Abstract
              </label>
              <textarea
                value={pub.abstract}
                onChange={(e) =>
                  updatePublication(index, "abstract", e.target.value)
                }
                rows={3}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Projects Section Component
function ProjectsSection({
  data,
  setData,
}: {
  data: Project[];
  setData: (data: Project[]) => void;
}) {
  const addProject = () => {
    const newProject: Project = {
      id: String(data.length + 1),
      title: "",
      description: "",
      technologies: [],
      github: "",
      demo: null,
      image: "",
      featured: false,
      date: new Date().toISOString().split("T")[0],
    };
    setData([...data, newProject]);
  };

  const updateProject = (index: number, field: keyof Project, value: any) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    setData(updated);
  };

  const removeProject = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Projects
        </h2>
        <button
          onClick={addProject}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Project
        </button>
      </div>

      {data.map((project, index) => (
        <div
          key={project.id}
          className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg space-y-4"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Project #{index + 1}
            </h3>
            <button
              onClick={() => removeProject(index)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={project.title}
                onChange={(e) => updateProject(index, "title", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={project.description}
                onChange={(e) =>
                  updateProject(index, "description", e.target.value)
                }
                rows={3}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Technologies (comma-separated)
              </label>
              <input
                type="text"
                value={project.technologies.join(", ")}
                onChange={(e) =>
                  updateProject(
                    index,
                    "technologies",
                    e.target.value.split(",").map((s) => s.trim()),
                  )
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                GitHub Link
              </label>
              <input
                type="url"
                value={project.github}
                onChange={(e) => updateProject(index, "github", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Demo Link
              </label>
              <input
                type="url"
                value={project.demo || ""}
                onChange={(e) =>
                  updateProject(index, "demo", e.target.value || null)
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <input
                type="text"
                value={project.date}
                onChange={(e) => updateProject(index, "date", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={project.featured}
                  onChange={(e) =>
                    updateProject(index, "featured", e.target.checked)
                  }
                  className="w-5 h-5"
                />
                Featured Project
              </label>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// NEW SECTION COMPONENTS - Copy these into the admin/edit/page.tsx file before the PreviewSection component

// Awards Section Component
function AwardsSection({
  data,
  setData,
}: {
  data: ProfileData;
  setData: (data: ProfileData) => void;
}) {
  const awards = data.awards || [];

  const addAward = () => {
    setData({
      ...data,
      awards: [...awards, { title: "", event: "", date: "", paperId: "" }],
    });
  };

  const removeAward = (index: number) => {
    setData({
      ...data,
      awards: awards.filter((_, i) => i !== index),
    });
  };

  const updateAward = (index: number, field: string, value: string) => {
    const updated = [...awards];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, awards: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Honors & Awards
        </h2>
        <button
          onClick={addAward}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Award
        </button>
      </div>

      {awards.map((award, index) => (
        <div
          key={index}
          className="p-4 border rounded-lg dark:border-gray-600 space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Award {index + 1}
            </h3>
            <button
              onClick={() => removeAward(index)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Award Title
            </label>
            <input
              type="text"
              value={award.title}
              onChange={(e) => updateAward(index, "title", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Top 10 Student Paper Awards"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Event/Conference
            </label>
            <input
              type="text"
              value={award.event}
              onChange={(e) => updateAward(index, "event", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="6th International Conference on..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <input
                type="text"
                value={award.date}
                onChange={(e) => updateAward(index, "date", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="May 6, 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paper ID (Optional)
              </label>
              <input
                type="text"
                value={award.paperId || ""}
                onChange={(e) => updateAward(index, "paperId", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Paper ID: 304"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Placeholder sections - these work but show minimal UI
// COMPLETE EDITING SECTIONS - Replace in admin/edit/page.tsx

// Reviews Section with Full Editing
function ReviewsSection({
  data,
  setData,
}: {
  data: ProfileData;
  setData: (data: ProfileData) => void;
}) {
  const reviews = data.reviewExperience || { journals: [], conferences: [] };

  const addJournal = () => {
    setData({
      ...data,
      reviewExperience: {
        ...reviews,
        journals: [...reviews.journals, ""],
      },
    });
  };

  const removeJournal = (index: number) => {
    setData({
      ...data,
      reviewExperience: {
        ...reviews,
        journals: reviews.journals.filter((_, i) => i !== index),
      },
    });
  };

  const updateJournal = (index: number, value: string) => {
    const updated = [...reviews.journals];
    updated[index] = value;
    setData({ ...data, reviewExperience: { ...reviews, journals: updated } });
  };

  const addConference = () => {
    setData({
      ...data,
      reviewExperience: {
        ...reviews,
        conferences: [
          ...reviews.conferences,
          {
            name: "",
            fullName: "",
            date: "",
            location: "",
            publisher: "",
            role: "",
          },
        ],
      },
    });
  };

  const removeConference = (index: number) => {
    setData({
      ...data,
      reviewExperience: {
        ...reviews,
        conferences: reviews.conferences.filter((_, i) => i !== index),
      },
    });
  };

  const updateConference = (index: number, field: string, value: string) => {
    const updated = [...reviews.conferences];
    updated[index] = { ...updated[index], [field]: value };
    setData({
      ...data,
      reviewExperience: { ...reviews, conferences: updated },
    });
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
        Review Experience
      </h2>

      {/* Journal Reviews */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Journal Reviews
          </h3>
          <button
            onClick={addJournal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add Journal
          </button>
        </div>

        {reviews.journals.map((journal, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={journal}
              onChange={(e) => updateJournal(index, e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Computers & Electrical Engineering (Elsevier)"
            />
            <button
              onClick={() => removeJournal(index)}
              className="text-red-600 hover:text-red-800 p-2"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Conference Reviews */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Conference Reviews
          </h3>
          <button
            onClick={addConference}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add Conference
          </button>
        </div>

        {reviews.conferences.map((conf, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg dark:border-gray-600 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Conference {index + 1}
              </h4>
              <button
                onClick={() => removeConference(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Short Name
                </label>
                <input
                  type="text"
                  value={conf.name}
                  onChange={(e) =>
                    updateConference(index, "name", e.target.value)
                  }
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="CISCom-2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={conf.fullName}
                  onChange={(e) =>
                    updateConference(index, "fullName", e.target.value)
                  }
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="1st International Conference on..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="text"
                  value={conf.date}
                  onChange={(e) =>
                    updateConference(index, "date", e.target.value)
                  }
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="November 26-27, 2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={conf.location}
                  onChange={(e) =>
                    updateConference(index, "location", e.target.value)
                  }
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Melaka, Malaysia"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Publisher
                </label>
                <input
                  type="text"
                  value={conf.publisher}
                  onChange={(e) =>
                    updateConference(index, "publisher", e.target.value)
                  }
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="IEEE"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={conf.role}
                  onChange={(e) =>
                    updateConference(index, "role", e.target.value)
                  }
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Technical Reviewer"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Memberships Section with Full Editing
function MembershipsSection({
  data,
  setData,
}: {
  data: ProfileData;
  setData: (data: ProfileData) => void;
}) {
  const memberships = data.memberships || [];

  const addMembership = () => {
    setData({
      ...data,
      memberships: [...memberships, { organization: "", period: "", type: "" }],
    });
  };

  const removeMembership = (index: number) => {
    setData({
      ...data,
      memberships: memberships.filter((_, i) => i !== index),
    });
  };

  const updateMembership = (index: number, field: string, value: string) => {
    const updated = [...memberships];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, memberships: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Professional Memberships
        </h2>
        <button
          onClick={addMembership}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Membership
        </button>
      </div>

      {memberships.map((membership, index) => (
        <div
          key={index}
          className="p-4 border rounded-lg dark:border-gray-600 space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Membership {index + 1}
            </h3>
            <button
              onClick={() => removeMembership(index)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Organization
            </label>
            <input
              type="text"
              value={membership.organization}
              onChange={(e) =>
                updateMembership(index, "organization", e.target.value)
              }
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Institute of Electrical and Electronics Engineers (IEEE)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Period
              </label>
              <input
                type="text"
                value={membership.period}
                onChange={(e) =>
                  updateMembership(index, "period", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="2025 - Present"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type/Role
              </label>
              <input
                type="text"
                value={membership.type}
                onChange={(e) =>
                  updateMembership(index, "type", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Graduate Student Member"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Certifications Section with Full Editing
function CertificationsSection({
  data,
  setData,
}: {
  data: ProfileData;
  setData: (data: ProfileData) => void;
}) {
  const certifications = data.certifications || [];

  const addCertification = () => {
    setData({
      ...data,
      certifications: [...certifications, ""],
    });
  };

  const removeCertification = (index: number) => {
    setData({
      ...data,
      certifications: certifications.filter((_, i) => i !== index),
    });
  };

  const updateCertification = (index: number, value: string) => {
    const updated = [...certifications];
    updated[index] = value;
    setData({ ...data, certifications: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Certifications & Achievements
        </h2>
        <button
          onClick={addCertification}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Certification
        </button>
      </div>

      {certifications.map((cert, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={cert}
            onChange={(e) => updateCertification(index, e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Microsoft Azure Fundamentals: Certificate of participation (AZ-900)"
          />
          <button
            onClick={() => removeCertification(index)}
            className="text-red-600 hover:text-red-800 p-2"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Volunteer Section with Full Editing
function VolunteerSection({
  data,
  setData,
}: {
  data: ProfileData;
  setData: (data: ProfileData) => void;
}) {
  const volunteer = data.volunteer || [];

  const addVolunteer = () => {
    setData({
      ...data,
      volunteer: [...volunteer, ""],
    });
  };

  const removeVolunteer = (index: number) => {
    setData({
      ...data,
      volunteer: volunteer.filter((_, i) => i !== index),
    });
  };

  const updateVolunteer = (index: number, value: string) => {
    const updated = [...volunteer];
    updated[index] = value;
    setData({ ...data, volunteer: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Volunteer Experience
        </h2>
        <button
          onClick={addVolunteer}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Volunteer
        </button>
      </div>

      {volunteer.map((vol, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={vol}
            onChange={(e) => updateVolunteer(index, e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="NWU CSE FEST-2023: Excellence as an Organizing Committee Member"
          />
          <button
            onClick={() => removeVolunteer(index)}
            className="text-red-600 hover:text-red-800 p-2"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// References Section with Full Editing
function ReferencesSection({
  data,
  setData,
}: {
  data: ProfileData;
  setData: (data: ProfileData) => void;
}) {
  const references = data.references || [];

  const addReference = () => {
    setData({
      ...data,
      references: [
        ...references,
        {
          name: "",
          position: "",
          department: "",
          institution: "",
          location: "",
          email: "",
          url: "",
        },
      ],
    });
  };

  const removeReference = (index: number) => {
    setData({
      ...data,
      references: references.filter((_, i) => i !== index),
    });
  };

  const updateReference = (index: number, field: string, value: string) => {
    const updated = [...references];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, references: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          References
        </h2>
        <button
          onClick={addReference}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Reference
        </button>
      </div>

      {references.map((ref, index) => (
        <div
          key={index}
          className="p-4 border rounded-lg dark:border-gray-600 space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Reference {index + 1}
            </h3>
            <button
              onClick={() => removeReference(index)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={ref.name}
                onChange={(e) => updateReference(index, "name", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Dr. Anupam Kumar Bairagi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Position
              </label>
              <input
                type="text"
                value={ref.position}
                onChange={(e) =>
                  updateReference(index, "position", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Professor"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Department
              </label>
              <input
                type="text"
                value={ref.department}
                onChange={(e) =>
                  updateReference(index, "department", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Computer Science and Engineering"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Institution
              </label>
              <input
                type="text"
                value={ref.institution}
                onChange={(e) =>
                  updateReference(index, "institution", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Khulna University"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={ref.location}
              onChange={(e) =>
                updateReference(index, "location", e.target.value)
              }
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Khulna-9208, Bangladesh"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={ref.email}
                onChange={(e) =>
                  updateReference(index, "email", e.target.value)
                }
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="anupam@cse.ku.ac.bd"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profile URL (Optional)
              </label>
              <input
                type="url"
                value={ref.url || ""}
                onChange={(e) => updateReference(index, "url", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="https://ku.ac.bd/..."
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Files (Photos & CV) Section Component
function FilesSection({
  data,
  setData,
}: {
  data: ProfileData;
  setData: (data: ProfileData) => void;
}) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [fileMessage, setFileMessage] = useState("");
  const [photos, setPhotos] = useState<Array<{ name: string; path: string; size: number }>>([]);
  const [cvFiles, setCvFiles] = useState<Array<{ name: string; path: string; size: number }>>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await fetch("/api/admin/list-files", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const result = await res.json();
      if (result.success) {
        setPhotos(result.photos || []);
        setCvFiles(result.cvFiles || []);
      }
    } catch (err) {
      console.error("Failed to load files:", err);
    }
    setLoadingFiles(false);
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    category: "photo-home" | "photo-about" | "cv",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(category);
    setFileMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const res = await fetch("/api/admin/upload-file", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (result.success) {
        setFileMessage(`✅ ${result.message}`);

        // Update profile data with new file paths
        if (category === "photo-home") {
          setData({ ...data, photo: result.filePath });
        } else if (category === "photo-about") {
          setData({ ...data, aboutPhoto: result.filePath });
        } else if (category === "cv") {
          setData({ ...data, cvPath: result.filePath });
        }

        // Refresh file list
        await fetchFiles();
      } else {
        setFileMessage(`❌ ${result.error}`);
      }
    } catch (err) {
      setFileMessage(`❌ Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    setUploading(null);
    // Reset file input
    e.target.value = "";
  };

  const handleDelete = async (filePath: string, category: string) => {
    if (!confirm(`Are you sure you want to delete ${filePath.split("/").pop()}?`)) return;

    setFileMessage("");
    try {
      const res = await fetch("/api/admin/delete-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath, category }),
      });

      const result = await res.json();
      if (result.success) {
        setFileMessage(`✅ ${result.message}`);
        await fetchFiles();
      } else {
        setFileMessage(`❌ ${result.error}`);
      }
    } catch (err) {
      setFileMessage(`❌ Delete failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        📁 Photos & Documents Management
      </h2>

      {fileMessage && (
        <div
          className={`p-3 rounded-lg ${fileMessage.includes("✅") ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}
        >
          {fileMessage}
        </div>
      )}

      {/* Homepage Photo */}
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Homepage Photo
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          This photo appears in the Hero section on your homepage.
          Current: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{data.photo || "/Hirak.jpg"}</code>
        </p>
        {data.photo && (
          <div className="mb-4">
            <img
              src={data.photo}
              alt="Homepage photo preview"
              className="w-32 h-32 object-cover rounded-lg border"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer">
            <Upload className="w-4 h-4" />
            {uploading === "photo-home" ? "Uploading..." : "Upload New Photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(e, "photo-home")}
              disabled={uploading !== null}
            />
          </label>
          <input
            type="text"
            value={data.photo || "/Hirak.jpg"}
            onChange={(e) => setData({ ...data, photo: e.target.value })}
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            placeholder="Or manually set path: /Hirak.jpg"
          />
        </div>
      </div>

      {/* About Section Photo */}
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          About Section Photo
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          This photo appears in the About Me section.
          Current: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{data.aboutPhoto || "/Abou.jpg"}</code>
        </p>
        {(data.aboutPhoto || "/Abou.jpg") && (
          <div className="mb-4">
            <img
              src={data.aboutPhoto || "/Abou.jpg"}
              alt="About photo preview"
              className="w-32 h-32 object-cover rounded-lg border"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer">
            <Upload className="w-4 h-4" />
            {uploading === "photo-about" ? "Uploading..." : "Upload New Photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(e, "photo-about")}
              disabled={uploading !== null}
            />
          </label>
          <input
            type="text"
            value={data.aboutPhoto || "/Abou.jpg"}
            onChange={(e) => setData({ ...data, aboutPhoto: e.target.value })}
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            placeholder="Or manually set path: /Abou.jpg"
          />
        </div>
      </div>

      {/* CV / Resume Upload */}
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          CV / Resume (PDF)
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Upload your CV as a PDF. The &ldquo;Download CV&rdquo; button will link to this file.
          Current: <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{data.cvPath || "/cv/Hirak.pdf"}</code>
        </p>

        {/* Current CV files */}
        {cvFiles.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current CV Files:</p>
            <div className="space-y-2">
              {cvFiles.map((file) => (
                <div key={file.path} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setData({ ...data, cvPath: `/cv/${file.name}` })}
                      className="text-sm bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded hover:bg-green-200"
                    >
                      Use This
                    </button>
                    <button
                      onClick={() => handleDelete(file.path, "cv")}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer">
            <Upload className="w-4 h-4" />
            {uploading === "cv" ? "Uploading..." : "Upload CV (PDF)"}
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => handleUpload(e, "cv")}
              disabled={uploading !== null}
            />
          </label>
          <input
            type="text"
            value={data.cvPath || "/cv/Hirak.pdf"}
            onChange={(e) => setData({ ...data, cvPath: e.target.value })}
            className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            placeholder="Or manually set path: /cv/Hirak.pdf"
          />
        </div>
      </div>

      {/* All Photos in Repository */}
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          All Photos in Repository
        </h3>

        {loadingFiles ? (
          <div className="flex items-center gap-2 text-gray-500">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading files...
          </div>
        ) : photos.length === 0 ? (
          <p className="text-gray-500">No image files found in public/ directory.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.path} className="relative group border rounded-lg overflow-hidden">
                <img
                  src={`/${photo.name}`}
                  alt={photo.name}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ccc' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23666'%3ENo Preview%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setData({ ...data, photo: `/${photo.name}` })}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                    title="Set as Homepage photo"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => setData({ ...data, aboutPhoto: `/${photo.name}` })}
                    className="text-xs bg-purple-500 text-white px-2 py-1 rounded"
                    title="Set as About photo"
                  >
                    About
                  </button>
                  <button
                    onClick={() => handleDelete(photo.path, "photo")}
                    className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="p-2 bg-white dark:bg-gray-800">
                  <p className="text-xs truncate text-gray-700 dark:text-gray-300">{photo.name}</p>
                  <p className="text-xs text-gray-400">{formatSize(photo.size)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={fetchFiles}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh File List
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
        <p className="text-yellow-800 dark:text-yellow-200 text-sm">
          <strong>Note:</strong> After uploading files, click &ldquo;Preview Changes&rdquo; then &ldquo;Confirm &amp; Update Website&rdquo;
          to save the photo/CV path settings. The file itself is uploaded immediately, but the profile data
          (which photo to use where) needs to be saved separately.
        </p>
      </div>
    </div>
  );
}

function PreviewSection({
  profileData,
  publications,
  projects,
  currentSection,
}: {
  profileData: ProfileData;
  publications: Publication[];
  projects: Project[];
  currentSection: Section;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-2">
          📋 Preview Mode
        </h2>
        <p className="text-blue-700 dark:text-blue-300">
          Review your changes below. If everything looks good, click
          &ldquo;Confirm &amp; Update Website&rdquo; to save.
        </p>
      </div>

      {currentSection === "profile" && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            Profile Information
          </h3>
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <strong>Name:</strong> {profileData.name || "(empty)"}
            </div>
            <div>
              <strong>Title:</strong> {profileData.title || "(empty)"}
            </div>
            <div className="col-span-2">
              <strong>Email:</strong> {profileData.email || "(empty)"}
            </div>
            <div className="col-span-2">
              <strong>Bio:</strong> {profileData.bio || "(empty)"}
            </div>
            <div className="col-span-2">
              <strong>Interests:</strong>{" "}
              {profileData.interests.join(", ") || "(empty)"}
            </div>
          </div>
        </div>
      )}

      {currentSection === "education" && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            Education ({profileData.education.length} items)
          </h3>
          {profileData.education.map((edu, i) => (
            <div
              key={i}
              className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <h4 className="font-bold text-lg">{edu.degree}</h4>
              <p className="text-gray-600 dark:text-gray-400">
                {edu.institution} • {edu.year}
              </p>
              <p className="mt-2">{edu.description}</p>
            </div>
          ))}
        </div>
      )}

      {currentSection === "experience" && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            Work Experience ({profileData.workExperience.length} items)
          </h3>
          {profileData.workExperience.map((exp, i) => (
            <div
              key={i}
              className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <h4 className="font-bold text-lg">{exp.position}</h4>
              <p className="text-gray-600 dark:text-gray-400">
                {exp.organization} • {exp.location} • {exp.period}
              </p>
              <p className="mt-2">{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {currentSection === "skills" && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            Skills
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <strong>Languages:</strong>{" "}
              {profileData.skills.languages.join(", ") || "(empty)"}
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <strong>Programming:</strong>{" "}
              {profileData.skills.programming.join(", ") || "(empty)"}
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <strong>Platforms:</strong>{" "}
              {profileData.skills.platforms.join(", ") || "(empty)"}
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <strong>Tools:</strong>{" "}
              {profileData.skills.tools.join(", ") || "(empty)"}
            </div>
          </div>
        </div>
      )}

      {currentSection === "social" && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            Social Links
          </h3>
          <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <strong>Google Scholar:</strong>{" "}
              {profileData.social.scholar || "(empty)"}
            </div>
            <div>
              <strong>GitHub:</strong> {profileData.social.github || "(empty)"}
            </div>
            <div>
              <strong>LinkedIn:</strong>{" "}
              {profileData.social.linkedin || "(empty)"}
            </div>
            <div>
              <strong>ORCID:</strong> {profileData.social.orcid || "(empty)"}
            </div>
            <div>
              <strong>ResearchGate:</strong>{" "}
              {profileData.social.researchgate || "(empty)"}
            </div>
          </div>
        </div>
      )}

      {currentSection === "publications" && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            Publications ({publications.length} items)
          </h3>
          {publications.map((pub, i) => (
            <div
              key={pub.id}
              className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <h4 className="font-bold">{pub.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {pub.authors.join(", ")}
              </p>
              <p className="text-sm mt-1">
                {pub.venue} ({pub.year}) • {pub.citations} citations
              </p>
            </div>
          ))}
        </div>
      )}

      {currentSection === "projects" && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            Projects ({projects.length} items)
          </h3>
          {projects.map((proj, i) => (
            <div
              key={proj.id}
              className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <h4 className="font-bold">
                {proj.title} {proj.featured && "⭐"}
              </h4>
              <p className="text-sm mt-1">{proj.description}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Tech: {proj.technologies.join(", ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
