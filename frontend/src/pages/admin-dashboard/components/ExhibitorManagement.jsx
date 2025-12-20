import { useState, useEffect } from "react";
import {
  useGetExhibitorsQuery,
  useCreateExhibitorMutation,
  useUpdateExhibitorMutation,
  useDeleteExhibitorMutation,
  useGetMoviesQuery,
} from "../../../store/apiSlice";
import Icon from "../../../components/AppIcon";

const ExhibitorManagement = () => {
  const [activeTab, setActiveTab] = useState("create");
  const {
    data: exhibitorsData,
    isLoading,
    error,
    refetch,
  } = useGetExhibitorsQuery();
  const exhibitors = exhibitorsData || [];
  const { data: moviesData } = useGetMoviesQuery();
  const movies = moviesData || [];
  const [createExhibitor, { isLoading: creating }] =
    useCreateExhibitorMutation();
  const [updateExhibitor, { isLoading: updating }] =
    useUpdateExhibitorMutation();
  const [deleteExhibitor, { isLoading: deleting }] =
    useDeleteExhibitorMutation();

  const [editingExhibitor, setEditingExhibitor] = useState(null);
  const [editExhibitor, setEditExhibitor] = useState({
    name: "",
    theater_location: "",
    contact: "",
    email: "",
    status: "active",
  });

  const handleEditExhibitor = (exhibitor) => {
    setEditingExhibitor(exhibitor);
    setEditExhibitor({
      name: exhibitor.name,
      theater_location: exhibitor.theater_location,
      contact: exhibitor.contact,
      email: exhibitor.email,
      status: exhibitor.status,
    });
    setActiveTab("edit");
  };

  const handleUpdateExhibitor = async (e) => {
    e.preventDefault();
    if (
      !editExhibitor.name ||
      !editExhibitor.theater_location ||
      !editExhibitor.contact
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await updateExhibitor({
        id: editingExhibitor.exhibitor_id,
        name: editExhibitor.name,
        theater_location: editExhibitor.theater_location,
        contact: editExhibitor.contact,
        email: editExhibitor.email,
        status: editExhibitor.status,
      }).unwrap();

      setEditingExhibitor(null);
      setEditExhibitor({
        name: "",
        theater_location: "",
        contact: "",
        email: "",
        status: "active",
      });
      setActiveTab("view");
      alert("Exhibitor updated successfully!");
    } catch (error) {
      alert(
        "Failed to update exhibitor: " +
          (error.data?.message || error.message)
      );
    }
  };

  const [newExhibitor, setNewExhibitor] = useState({
    theaterName: "",
    address: "",
    contactPerson: "",
    phone: "",
    email: "",
    gstNumber: "",
  });

  const [assignmentData, setAssignmentData] = useState({
    exhibitorId: "",
    movieId: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Auto-generate login email
  const generateLoginEmail = (theaterName) => {
    const cleanName = theaterName.toLowerCase().replace(/[^a-z0-9]/g, "");
    return cleanName
      ? `${cleanName}@moviedist.com`
      : "theater@moviedist.com";
  };

  // Generate temporary password
  const generateTempPassword = () => {
    return Math.random().toString(36).slice(-8).toUpperCase();
  };

  const handleCreateExhibitor = async (e) => {
    e.preventDefault();
    if (
      !newExhibitor.theaterName ||
      !newExhibitor.address ||
      !newExhibitor.contactPerson
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const result = await createExhibitor({
        name: newExhibitor.theaterName,
        theater_location: newExhibitor.address,
        contact: `${newExhibitor.contactPerson}${
          newExhibitor.phone ? ` - ${newExhibitor.phone}` : ""
        }`,
        email: newExhibitor.email,
      }).unwrap();

      setNewExhibitor({
        theaterName: "",
        address: "",
        contactPerson: "",
        phone: "",
        email: "",
        gstNumber: "",
      });

      alert(
        `Exhibitor created successfully!\nExhibitor ID: ${result.exhibitor_id}\nTemp Email: ${result.temp_email}\nTemp Password: ${result.temp_password}`
      );
    } catch (error) {
      alert(
        "Failed to create exhibitor: " +
          (error.data?.message || error.message)
      );
    }
  };

  const handleAssignToMovie = async (e) => {
    e.preventDefault();
    if (!assignmentData.exhibitorId || !assignmentData.movieId) {
      alert("Please select both exhibitor and movie");
      return;
    }

    try {
      await createAssignments({
        movie_id: assignmentData.movieId,
        exhibitor_ids: [assignmentData.exhibitorId],
      }).unwrap();

      setAssignmentData({ exhibitorId: "", movieId: "" });
      alert("Exhibitor assigned to movie successfully!");
    } catch (error) {
      alert("Failed to assign: " + (error.data?.message || error.message));
    }
  };

  const handleRemoveFromMovie = (exhibitorId, movieId) => {
    if (
      confirm(
        "Are you sure you want to remove this exhibitor from the movie?"
      )
    ) {
      setExhibitors((prev) =>
        prev.map((exhibitor) => {
          if (exhibitor.id === exhibitorId) {
            return {
              ...exhibitor,
              assignedMovies: exhibitor.assignedMovies.filter(
                (id) => id !== movieId
              ),
            };
          }
          return exhibitor;
        })
      );
    }
  };

  const handleDeactivateExhibitor = async (exhibitorId) => {
    if (confirm("Are you sure you want to deactivate this exhibitor?")) {
      try {
        await updateExhibitor({
          id: exhibitorId,
          status: "inactive",
        }).unwrap();
        alert("Exhibitor deactivated successfully!");
      } catch (error) {
        alert(
          "Failed to deactivate: " + (error.data?.message || error.message)
        );
      }
    }
  };

  const filteredExhibitors = exhibitors.filter((exhibitor) => {
    const matchesSearch =
      (exhibitor.name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (exhibitor.contact?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (exhibitor.theater_location?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (exhibitor.email?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );
    const matchesFilter =
      filterStatus === "all" || exhibitor.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getMovieName = (movieId) => {
    const movie = movies.find((m) => m.id === movieId);
    return movie ? movie.name : movieId;
  };

  const tabs = [
    { id: "create", label: "Create Exhibitor", icon: "Plus" },
    { id: "assign", label: "Assign to Movies", icon: "Link" },
    { id: "view", label: "View All Exhibitors", icon: "List" },
    { id: "manage", label: "Manage Details", icon: "Settings" },
  ];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold text-foreground">
            Exhibitor Management
          </h2>
          <div className="flex items-center gap-2">
            <Icon
              name="Building2"
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
        {activeTab === "create" && (
          <div className="max-w-2xl">
            <form
              onSubmit={handleCreateExhibitor}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Theater Name *
                  </label>
                  <input
                    type="text"
                    value={newExhibitor.theaterName}
                    onChange={(e) =>
                      setNewExhibitor((prev) => ({
                        ...prev,
                        theaterName: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter theater name"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Address *
                  </label>
                  <textarea
                    value={newExhibitor.address}
                    onChange={(e) =>
                      setNewExhibitor((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter complete address"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    value={newExhibitor.contactPerson}
                    onChange={(e) =>
                      setNewExhibitor((prev) => ({
                        ...prev,
                        contactPerson: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter contact person name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newExhibitor.phone}
                    onChange={(e) =>
                      setNewExhibitor((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newExhibitor.email}
                    onChange={(e) =>
                      setNewExhibitor((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={newExhibitor.gstNumber}
                    onChange={(e) =>
                      setNewExhibitor((prev) => ({
                        ...prev,
                        gstNumber: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter GST number"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Common for all movie forms
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Login Email (Auto-generated)
                  </label>
                  <div className="px-3 py-2 bg-muted border border-border rounded-md text-muted-foreground">
                    {newExhibitor.theaterName
                      ? generateLoginEmail(newExhibitor.theaterName)
                      : "theater@moviedist.com"}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Create Exhibitor Account
              </button>
            </form>
          </div>
        )}

        {activeTab === "assign" && (
          <div className="max-w-md space-y-6">
            <form
              onSubmit={handleAssignToMovie}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Exhibitor
                </label>
                <select
                  value={assignmentData.exhibitorId}
                  onChange={(e) =>
                    setAssignmentData((prev) => ({
                      ...prev,
                      exhibitorId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Choose exhibitor...</option>
                  {exhibitors
                    .filter((e) => e.status === "active")
                    .map((exhibitor) => (
                      <option
                        key={exhibitor._id}
                        value={exhibitor.exhibitor_id}
                      >
                        {exhibitor.name} ({exhibitor.exhibitor_id})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Movie
                </label>
                <select
                  value={assignmentData.movieId}
                  onChange={(e) =>
                    setAssignmentData((prev) => ({
                      ...prev,
                      movieId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Choose movie...</option>
                  {movies.map((movie) => (
                    <option
                      key={movie.id}
                      value={movie.id}
                    >
                      {movie.name} ({movie.id})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Assign to Movie
              </button>
            </form>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium text-foreground mb-2">
                Assignment Rules
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • Same exhibitor can be assigned to multiple movies
                </li>
                <li>
                  • Multiple exhibitors can be assigned to same movie
                </li>
                <li>• Exhibitor gets access only to assigned movies</li>
                <li>• Can reassign after removal</li>
              </ul>
            </div>
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
                    placeholder="Search theaters, contacts, or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredExhibitors.map((exhibitor) => (
                <div
                  key={exhibitor.exhibitor_id}
                  className="bg-muted/30 border border-border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {exhibitor.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {exhibitor.exhibitor_id}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          exhibitor.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {exhibitor.status}
                      </span>
                      <button
                        onClick={() => handleEditExhibitor(exhibitor)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        <Icon
                          name="Edit"
                          size={16}
                        />
                      </button>
                      {exhibitor.status === "active" && (
                        <button
                          onClick={() =>
                            handleDeactivateExhibitor(
                              exhibitor.exhibitor_id
                            )
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          <Icon
                            name="UserX"
                            size={16}
                          />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p>
                        <strong>Contact:</strong> {exhibitor.contact}
                      </p>
                      <p>
                        <strong>Email:</strong> {exhibitor.email}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Address:</strong>{" "}
                        {exhibitor.theater_location}
                      </p>
                      <p>
                        <strong>Login:</strong>{" "}
                        {exhibitor.login_credentials.email}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredExhibitors.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Icon
                  name="Building2"
                  size={48}
                  className="mx-auto mb-4 opacity-50"
                />
                <p>No exhibitors found matching your criteria</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "manage" && (
          <div className="text-center py-8 text-muted-foreground">
            <Icon
              name="Settings"
              size={48}
              className="mx-auto mb-4 opacity-50"
            />
            <p>
              Exhibitor management functionality will be implemented here
            </p>
            <p className="text-sm mt-2">
              Edit contact info, update GST, reset passwords, view history
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExhibitorManagement;
