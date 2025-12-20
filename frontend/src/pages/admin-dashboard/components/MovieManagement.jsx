import { useState, useEffect } from "react";
import {
  useGetMoviesQuery,
  useCreateMovieMutation,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
} from "../../../store/apiSlice";
import Icon from "../../../components/AppIcon";

const MovieManagement = () => {
  const [activeTab, setActiveTab] = useState("create");
  const {
    data: moviesData,
    isLoading,
    error,
    refetch,
  } = useGetMoviesQuery();
  const movies = moviesData || [];
  const [createMovie, { isLoading: creating }] = useCreateMovieMutation();
  const [updateMovie, { isLoading: updating }] = useUpdateMovieMutation();
  const [deleteMovie, { isLoading: deleting }] = useDeleteMovieMutation();

  const [newMovie, setNewMovie] = useState({
    title: "",
    release_date: "",
    genre: "",
    description: "",
  });

  const [editingMovie, setEditingMovie] = useState(null);
  const [editMovie, setEditMovie] = useState({
    title: "",
    release_date: "",
    genre: "",
    description: "",
    status: "active",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    if (!newMovie.title || !newMovie.release_date) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await createMovie({
        title: newMovie.title,
        release_date: newMovie.release_date,
        genre: newMovie.genre,
        description: newMovie.description,
      }).unwrap();

      setNewMovie({
        title: "",
        release_date: "",
        genre: "",
        description: "",
      });
      alert("Movie created successfully!");
    } catch (error) {
      alert(
        "Failed to create movie: " + (error.data?.message || error.message)
      );
    }
  };

  const handleMovieNameChange = (name) => {
    setNewMovie((prev) => {
      const emails = generateEmails(name);
      return {
        ...prev,
        name,
        managerEmail: prev.managerEmail || emails.managerEmail,
        producerEmail: prev.producerEmail || emails.producerEmail,
      };
    });
  };

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch =
      (movie.title?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (movie.movie_id?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );
    const matchesFilter =
      filterStatus === "all" || movie.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const exportToExcel = () => {
    // Simple CSV export
    const headers = [
      "Movie ID",
      "Title",
      "Release Date",
      "Genre",
      "Status",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredMovies.map((movie) =>
        [
          movie.movie_id,
          `"${movie.title}"`,
          movie.release_date,
          movie.genre || "",
          movie.status,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "movies_export.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: "create", label: "Create New Movie", icon: "Plus" },
    { id: "view", label: "View All Movies", icon: "List" },
    { id: "edit", label: "Edit Movies", icon: "Edit" },
    { id: "settings", label: "Movie Settings", icon: "Settings" },
  ];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold text-foreground">
            Movie Management
          </h2>
          <div className="flex items-center gap-2">
            <Icon
              name="Film"
              size={20}
              className="text-primary"
            />
          </div>
        </div>

        <div className="border-b border-border overflow-x-auto">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon
                  name={tab.icon}
                  size={16}
                />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading movies...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            Error loading movies: {error.message}
          </div>
        ) : (
          <>
            {activeTab === "create" && (
              <div className="max-w-2xl">
                <form
                  onSubmit={handleCreateMovie}
                  className="space-y-6"
                >
                  <div className="grid grid-responsive grid-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={newMovie.title}
                        onChange={(e) =>
                          setNewMovie((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter movie title"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Release Date *
                      </label>
                      <input
                        type="date"
                        value={newMovie.release_date}
                        onChange={(e) =>
                          setNewMovie((prev) => ({
                            ...prev,
                            release_date: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Genre
                      </label>
                      <input
                        type="text"
                        value={newMovie.genre}
                        onChange={(e) =>
                          setNewMovie((prev) => ({
                            ...prev,
                            genre: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter genre"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Description
                      </label>
                      <textarea
                        value={newMovie.description}
                        onChange={(e) =>
                          setNewMovie((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter movie description"
                        rows="3"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create Movie"}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "view" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Icon
                        name="Search"
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      />
                      <input
                        type="text"
                        placeholder="Search movies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <button
                    onClick={exportToExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md transition-colors"
                  >
                    <Icon
                      name="Download"
                      size={16}
                    />
                    Export CSV
                  </button>
                </div>

                <div className="overflow-x-auto border border-border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          Movie ID
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          Title
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          Release Date
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          Genre
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMovies.map((movie) => (
                        <tr
                          key={movie._id}
                          className="border-t border-border hover:bg-muted/30"
                        >
                          <td className="py-3 px-4">{movie.movie_id}</td>
                          <td className="py-3 px-4 font-medium">
                            {movie.title}
                          </td>
                          <td className="py-3 px-4">
                            {new Date(
                              movie.release_date
                            ).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {movie.genre || "N/A"}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                movie.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {movie.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleEditMovie(movie)}
                              className="text-blue-600 hover:text-blue-800 mr-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMovie(movie._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredMovies.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon
                      name="Search"
                      size={48}
                      className="mx-auto mb-4 opacity-50"
                    />
                    <p>No movies found matching your criteria</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "edit" && editingMovie && (
              <div className="max-w-2xl">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">
                    Editing: {editingMovie.title} ({editingMovie.movie_id})
                  </h3>
                </div>
                <form
                  onSubmit={handleUpdateMovie}
                  className="space-y-6"
                >
                  <div className="grid grid-responsive grid-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={editMovie.title}
                        onChange={(e) =>
                          setEditMovie((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Release Date *
                      </label>
                      <input
                        type="date"
                        value={editMovie.release_date}
                        onChange={(e) =>
                          setEditMovie((prev) => ({
                            ...prev,
                            release_date: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Genre
                      </label>
                      <input
                        type="text"
                        value={editMovie.genre}
                        onChange={(e) =>
                          setEditMovie((prev) => ({
                            ...prev,
                            genre: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Status
                      </label>
                      <select
                        value={editMovie.status}
                        onChange={(e) =>
                          setEditMovie((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Description
                      </label>
                      <textarea
                        value={editMovie.description}
                        onChange={(e) =>
                          setEditMovie((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        rows="3"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
                    >
                      {updating ? "Updating..." : "Update Movie"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMovie(null);
                        setEditMovie({
                          title: "",
                          release_date: "",
                          genre: "",
                          description: "",
                          status: "active",
                        });
                        setActiveTab("view");
                      }}
                      className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="text-center py-8 text-muted-foreground">
                <Icon
                  name="Settings"
                  size={48}
                  className="mx-auto mb-4 opacity-50"
                />
                <p>
                  Movie settings functionality will be implemented here
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MovieManagement;
