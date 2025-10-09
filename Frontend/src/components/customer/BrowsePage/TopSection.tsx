import React from "react";
import { Search } from "lucide-react";
import { SlidersHorizontal } from "lucide-react";

const TopSection = () => {


    // const [search, setSearch] = useState("");
   
    //  const filteredCompanies = companies.filter((c) =>
    //    c.name.toLowerCase().includes(search.toLowerCase())
    //  );

    
  return (
    <>
      <div
        className="container text-start"
        style={{ marginTop: "90px", marginLeft: "-240px" }}
      >
        <h1 className="fw-bold text-white mb-2">Browse Companies</h1>
        <p className="text-secondary mb-4">
          Discover and connect with top-rated companies
        </p>

        <div
          className="d-flex align-items-center px-4 py-1"
          style={{
            backgroundColor: "#001328",
            border: "1px solid #003566",
            maxWidth: "1700px",
            width: "150%",
            borderRadius: "10px",
          }}
        >
          <Search color="#ffffff" size={27} className="me-3" />
          <input
            type="text"
            placeholder="Search companies by name, industry, or location..."
            className="form-control border-0 bg-transparent text-white"
            style={{
              boxShadow: "none",
              fontSize: "18px",
              paddingLeft: "2px",
            }}
          />
        </div>

        <div
          className="container-fluid mt-4 p-3"
          style={{ maxWidth: "1700px", width: "150%" }}
        >
          <div className="d-flex align-items-center justify-content-between mb-1">
            <div className="d-flex align-items-center">
              <SlidersHorizontal className="me-2" />
              <h5 className="mb-1 me-4">Filters</h5>
              <div className="d-flex gap-3">
                <select
                  className="form-select"
                  style={{
                    backgroundColor: "#001328",
                    color: "white",
                    borderColor: "#003566",
                    borderRadius: "8px",
                  }}
                >
                  <option value="">All Categories</option>
                  <option value="software">Software</option>
                  <option value="marketing">Marketing</option>
                  <option value="design">Design</option>
                </select>
                <select
                  className="form-select"
                  style={{
                    backgroundColor: "#001328",
                    color: "white",
                    borderColor: "#003566",
                    borderRadius: "8px",
                  }}
                >
                  <option value="">Sort by Rating</option>
                  <option value="high">Highest Rated</option>
                  <option value="low">Lowest Rated</option>
                </select>
              </div>
            </div>

            <h6 className="mb-1">
              <span style={{ color: "#FFC300" }}>24</span> Companies Found
            </h6>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopSection;
