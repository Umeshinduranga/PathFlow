"use client";

import React, { useState, useEffect } from "react";

interface PathData {
    _id: string;
    goal: string;
    skills: string[];
    path: string[];
    completedSteps: number[];
    totalSteps: number;
    completedCount: number;
    progressPercentage: number;
    generatedBy: string;
    createdAt: string;
}

function parseMarkdown(text: string): React.ReactNode {
    if (!text) return text;
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
}

function getProgressColor(percentage: number): string {
    if (percentage === 0) return "#6c757d";
    if (percentage < 30) return "#ff6b6b";
    if (percentage < 70) return "#f093fb";
    if (percentage < 100) return "#4facfe";
    return "#43e97b";
}

interface StatCardProps { icon: string; label: string; value: string | number; color: string; }
function StatCard({ icon, label, value, color }: StatCardProps) {
    return (
        <div style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "15px", padding: "1.5rem", textAlign: "center", transition: "transform 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.borderColor = color; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{icon}</div>
            <div style={{ color: "#a0a0a0", fontSize: "0.9rem", marginBottom: "0.3rem" }}>{label}</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "bold", color }}>{value}</div>
        </div>
    );
}

interface PathCardProps { path: PathData; onSelect: () => void; onDelete: () => void; }
function PathCard({ path, onSelect, onDelete }: PathCardProps) {
    const color = getProgressColor(path.progressPercentage);
    return (
        <div style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "15px", padding: "1.5rem", cursor: "pointer", transition: "transform 0.2s, border-color 0.2s", position: "relative" }}
            onClick={onSelect}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.borderColor = color; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
                style={{ position: "absolute", top: "1rem", right: "1rem", backgroundColor: "transparent", border: "none", color: "#ff6b6b", cursor: "pointer", fontSize: "1.2rem", opacity: 0.6, transition: "opacity 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget).style.opacity = "1"; }}
                onMouseLeave={(e) => { (e.currentTarget).style.opacity = "0.6"; }} title="Delete path">
                🗑️
            </button>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "0.8rem", paddingRight: "2rem", color: "white" }}>{path.goal}</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                {path.skills.slice(0, 3).map((skill, idx) => (
                    <span key={idx} style={{ padding: "0.3rem 0.8rem", backgroundColor: "rgba(102,126,234,0.2)", color: "#667eea", borderRadius: "20px", fontSize: "0.85rem" }}>{skill}</span>
                ))}
                {path.skills.length > 3 && <span style={{ padding: "0.3rem 0.8rem", color: "#a0a0a0", fontSize: "0.85rem" }}>+{path.skills.length - 3} more</span>}
            </div>
            <div style={{ marginBottom: "0.8rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                    <span style={{ color: "#a0a0a0" }}>Progress</span>
                    <span style={{ color, fontWeight: "bold" }}>{path.progressPercentage}%</span>
                </div>
                <div style={{ height: "8px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "10px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${path.progressPercentage}%`, backgroundColor: color, transition: "width 0.3s ease", borderRadius: "10px" }} />
                </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#a0a0a0" }}>
                <span>{path.completedCount}/{path.totalSteps} steps</span>
                <span>{new Date(path.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    );
}

interface PathDetailModalProps { path: PathData; onClose: () => void; onToggleStep: (id: string, idx: number) => void; onDelete: () => void; }
function PathDetailModal({ path, onClose, onToggleStep }: PathDetailModalProps) {
    return (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "2rem" }} onClick={onClose}>
            <div style={{ backgroundColor: "#1a1a2e", borderRadius: "20px", maxWidth: "800px", width: "100%", maxHeight: "90vh", overflow: "auto", padding: "2rem", position: "relative" }} onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", backgroundColor: "transparent", border: "none", color: "white", fontSize: "1.5rem", cursor: "pointer", opacity: 0.7 }}>✕</button>
                <h2 style={{ fontSize: "2rem", marginBottom: "1rem", paddingRight: "3rem", color: "white" }}>{path.goal}</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
                    {path.skills.map((skill, idx) => (
                        <span key={idx} style={{ padding: "0.5rem 1rem", backgroundColor: "rgba(102,126,234,0.2)", color: "#667eea", borderRadius: "20px", fontSize: "0.9rem" }}>{skill}</span>
                    ))}
                </div>
                {/* Progress Bar */}
                <div style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "15px", padding: "1.5rem", marginBottom: "2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <span style={{ color: "#a0a0a0" }}>Overall Progress</span>
                        <span style={{ color: path.progressPercentage === 100 ? "#43e97b" : "#4facfe", fontWeight: "bold", fontSize: "1.1rem" }}>{path.progressPercentage}%</span>
                    </div>
                    <div style={{ height: "12px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "10px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${path.progressPercentage}%`, background: path.progressPercentage === 100 ? "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)" : "linear-gradient(90deg, #667eea 0%, #764ba2 100%)", borderRadius: "10px" }} />
                    </div>
                    <div style={{ marginTop: "0.8rem", fontSize: "0.9rem", color: "#a0a0a0", textAlign: "center" }}>{path.completedCount} of {path.totalSteps} steps completed</div>
                </div>
                <h3 style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "white" }}>📋 Learning Steps</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {path.path.map((step, index) => {
                        const isCompleted = path.completedSteps?.includes(index);
                        return (
                            <div key={index}
                                style={{ backgroundColor: isCompleted ? "rgba(67,233,123,0.1)" : "rgba(255,255,255,0.05)", border: `1px solid ${isCompleted ? "#43e97b" : "rgba(255,255,255,0.1)"}`, borderRadius: "12px", padding: "1rem", display: "flex", alignItems: "flex-start", gap: "1rem", cursor: "pointer", opacity: isCompleted ? 0.7 : 1 }}
                                onClick={() => onToggleStep(path._id, index)}>
                                <div style={{ width: "24px", height: "24px", borderRadius: "6px", border: `2px solid ${isCompleted ? "#43e97b" : "rgba(255,255,255,0.3)"}`, backgroundColor: isCompleted ? "#43e97b" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    {isCompleted && <span style={{ color: "white", fontSize: "0.9rem" }}>✓</span>}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <span style={{ fontWeight: "bold", color: "#667eea", marginRight: "0.5rem" }}>Step {index + 1}</span>
                                    <span style={{ color: isCompleted ? "#a0a0a0" : "white" }}>{parseMarkdown(step)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default function MyLearning() {
    const [paths, setPaths] = useState<PathData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");
    const [sortBy, setSortBy] = useState("recent");
    const [selectedPath, setSelectedPath] = useState<PathData | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("authToken") : null);

    useEffect(() => { fetchMyPaths(); }, []);

    const fetchMyPaths = async () => {
        try {
            setLoading(true);
            setError("");
            const token = getToken();
            if (!token) { setError("Please log in to view your learning paths"); setLoading(false); return; }
            const response = await fetch("/api/paths/my-paths", { headers: { Authorization: `Bearer ${token}` } });
            if (response.status === 401) { setError("Session expired. Please log in again."); setLoading(false); return; }
            const data = await response.json();
            if (data.success) setPaths(data.paths);
        } catch { setError("Failed to load your learning paths"); }
        finally { setLoading(false); }
    };

    const toggleStepCompletion = async (pathId: string, stepIndex: number) => {
        try {
            const token = getToken();
            const response = await fetch(`/api/paths/${pathId}/steps/${stepIndex}`, {
                method: "PATCH", headers: { Authorization: `Bearer ${token || ""}` },
            });
            const data = await response.json();
            if (data.success) {
                setPaths((prev) => prev.map((p) => {
                    if (p._id === pathId) {
                        const completedSteps = data.path.completedSteps;
                        const completedCount = completedSteps.length;
                        const progressPercentage = Math.round((completedCount / p.totalSteps) * 100);
                        return { ...p, completedSteps, completedCount, progressPercentage };
                    }
                    return p;
                }));
                if (selectedPath?._id === pathId) {
                    setSelectedPath((prev) => prev ? { ...prev, completedSteps: data.path.completedSteps, completedCount: data.path.completedCount, progressPercentage: data.path.progressPercentage } : null);
                }
            }
        } catch { setError("Failed to update step completion"); setTimeout(() => setError(""), 3000); }
    };

    const deletePath = async (pathId: string) => {
        try {
            const token = getToken();
            const response = await fetch(`/api/paths/${pathId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token || ""}` } });
            const data = await response.json();
            if (data.success) {
                setPaths((prev) => prev.filter((p) => p._id !== pathId));
                setShowDeleteConfirm(null);
                if (selectedPath?._id === pathId) setSelectedPath(null);
            }
        } catch { setError("Failed to delete learning path"); setTimeout(() => setError(""), 3000); }
    };

    const getFilteredSortedPaths = () => {
        let filtered = [...paths];
        if (filter === "in-progress") filtered = filtered.filter((p) => p.progressPercentage > 0 && p.progressPercentage < 100);
        else if (filter === "completed") filtered = filtered.filter((p) => p.progressPercentage === 100);
        else if (filter === "not-started") filtered = filtered.filter((p) => p.progressPercentage === 0);
        if (sortBy === "recent") filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        else if (sortBy === "progress") filtered.sort((a, b) => b.progressPercentage - a.progressPercentage);
        else if (sortBy === "name") filtered.sort((a, b) => a.goal.localeCompare(b.goal));
        return filtered;
    };

    const stats = {
        total: paths.length,
        inProgress: paths.filter((p) => p.progressPercentage > 0 && p.progressPercentage < 100).length,
        completed: paths.filter((p) => p.progressPercentage === 100).length,
        notStarted: paths.filter((p) => p.progressPercentage === 0).length,
        totalSteps: paths.reduce((s, p) => s + p.totalSteps, 0),
        completedSteps: paths.reduce((s, p) => s + p.completedCount, 0),
    };

    if (loading) return <div style={{ padding: "2rem", textAlign: "center", color: "white" }}>📚 Loading your learning paths...</div>;
    if (error && paths.length === 0) return <div style={{ padding: "2rem", textAlign: "center" }}><div style={{ backgroundColor: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "15px", padding: "2rem", maxWidth: "600px", margin: "0 auto" }}><div style={{ fontSize: "3rem" }}>⚠️</div><p style={{ color: "#ff6b6b" }}>{error}</p></div></div>;

    const filteredPaths = getFilteredSortedPaths();

    return (
        <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto", color: "white" }}>
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "0.5rem" }}>📚 My Learning Paths</h1>
                <p style={{ color: "#a0a0a0", fontSize: "1.1rem" }}>Track your progress and complete your learning goals</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                <StatCard icon="📊" label="Total Paths" value={stats.total} color="#667eea" />
                <StatCard icon="🚀" label="In Progress" value={stats.inProgress} color="#f093fb" />
                <StatCard icon="✅" label="Completed" value={stats.completed} color="#4facfe" />
                <StatCard icon="📝" label="Steps Done" value={`${stats.completedSteps}/${stats.totalSteps}`} color="#43e97b" />
            </div>

            {error && <div style={{ backgroundColor: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "10px", padding: "1rem", marginBottom: "1rem", color: "#ff6b6b" }}>{error}</div>}

            {paths.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "15px", border: "2px dashed rgba(255,255,255,0.2)" }}>
                    <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎯</div>
                    <h2 style={{ marginBottom: "1rem" }}>No Learning Paths Yet</h2>
                    <p style={{ color: "#a0a0a0", marginBottom: "2rem" }}>Generate your first learning path to get started!</p>
                </div>
            ) : (
                <>
                    <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            {[{ key: "all", label: "All", count: stats.total }, { key: "in-progress", label: "In Progress", count: stats.inProgress }, { key: "completed", label: "Completed", count: stats.completed }, { key: "not-started", label: "Not Started", count: stats.notStarted }].map(({ key, label, count }) => (
                                <button key={key} onClick={() => setFilter(key)}
                                    style={{ padding: "0.6rem 1.2rem", backgroundColor: filter === key ? "#667eea" : "rgba(255,255,255,0.05)", color: filter === key ? "white" : "#a0a0a0", border: `1px solid ${filter === key ? "#667eea" : "rgba(255,255,255,0.1)"}`, borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem", fontWeight: filter === key ? "bold" : "normal" }}>
                                    {label} ({count})
                                </button>
                            ))}
                        </div>
                        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <span style={{ color: "#a0a0a0", fontSize: "0.9rem" }}>Sort by:</span>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                                style={{ padding: "0.5rem 1rem", backgroundColor: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", cursor: "pointer" }}>
                                <option value="recent">Most Recent</option>
                                <option value="progress">Progress</option>
                                <option value="name">Name (A-Z)</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.5rem" }}>
                        {filteredPaths.map((path) => (
                            <PathCard key={path._id} path={path} onSelect={() => setSelectedPath(path)} onDelete={() => setShowDeleteConfirm(path._id)} />
                        ))}
                    </div>

                    {filteredPaths.length === 0 && (
                        <div style={{ textAlign: "center", padding: "3rem", color: "#a0a0a0", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "15px" }}>
                            <div style={{ fontSize: "3rem" }}>🔍</div>
                            <p style={{ fontSize: "1.1rem" }}>No paths match this filter</p>
                        </div>
                    )}
                </>
            )}

            {selectedPath && (
                <PathDetailModal path={selectedPath} onClose={() => setSelectedPath(null)} onToggleStep={toggleStepCompletion} onDelete={() => setShowDeleteConfirm(selectedPath._id)} />
            )}

            {showDeleteConfirm && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1001 }}>
                    <div style={{ backgroundColor: "#1a1a2e", borderRadius: "15px", padding: "2rem", maxWidth: "400px", width: "100%", textAlign: "center" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗑️</div>
                        <h3>Delete this learning path?</h3>
                        <p style={{ color: "#a0a0a0", margin: "1rem 0" }}>This action cannot be undone.</p>
                        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                            <button onClick={() => deletePath(showDeleteConfirm)} style={{ padding: "0.75rem 1.5rem", backgroundColor: "#ef4444", border: "none", borderRadius: "8px", color: "white", cursor: "pointer", fontWeight: "bold" }}>🗑️ Delete</button>
                            <button onClick={() => setShowDeleteConfirm(null)} style={{ padding: "0.75rem 1.5rem", backgroundColor: "rgba(255,255,255,0.1)", border: "none", borderRadius: "8px", color: "white", cursor: "pointer" }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
