import { useCallback, useEffect, useRef, useState } from "react";
import { Heading, Button, Spinner, Text } from "@chakra-ui/react";
import "../index.css";
import "./Patients.css";
import PatientCard from "../components/PatientCard";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";

type Patient = {
  id: number;
  name: string;
  gender: string;
  age: number | string | null;
  diagnosis: string | null;
  status: string;
  cnp: string;
};

const LIMIT = 10;

function Patients() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const offsetRef = useRef(0);
  const searchRef = useRef("");
  const loaderRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasMoreRef.current) return;
    isFetchingRef.current = true;
    setIsFetching(true);
    try {
      const s = searchRef.current;
      const url = `http://localhost:3001/api/patients?limit=${LIMIT}&offset=${offsetRef.current}${s ? `&search=${encodeURIComponent(s)}` : ""}`;
      const res = await fetch(url);
      const data: Patient[] = await res.json();
      setPatients((prev) => [...prev, ...data]);
      offsetRef.current += data.length;
      if (data.length < LIMIT) {
        hasMoreRef.current = false;
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
    } finally {
      isFetchingRef.current = false;
      setIsFetching(false);
      // IntersectionObserver fires once on mount while the initial fetch is in-flight
      // and won't re-fire if the sentinel stays visible. Re-check after each load.
      requestAnimationFrame(() => {
        if (hasMoreRef.current && loaderRef.current) {
          const { top } = loaderRef.current.getBoundingClientRect();
          if (top < window.innerHeight) loadMore();
        }
      });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    searchRef.current = debouncedSearch;
    setPatients([]);
    offsetRef.current = 0;
    hasMoreRef.current = true;
    isFetchingRef.current = false;
    setHasMore(true);
    loadMore();
  }, [debouncedSearch, loadMore]);

  useEffect(() => {
    const sentinel = loaderRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      <div className="patients-page">
        <div className="patients-header-row">
          <Heading as="h3" size="md">
            Patients
          </Heading>

          <Button
            variant="solid"
            colorScheme="green"
            onClick={() => navigate("/doctor/dashboard/add-patient")}
          >
            <i className="bi bi-person-add button-icon-spacing"></i>
            Add Patient
          </Button>
        </div>

        <Text fontSize="xs">{patients.length} patients loaded</Text>
      </div>

      <div className="search-bar-patients">
        <SearchBar
          className="search-bar-patients"
          placeholder="Search patients..."
          value={search}
          onChange={setSearch}
        />
      </div>

      <div className="patients-list-cards">
        {patients.map((p) => (
          <PatientCard
            cnp={p.cnp}
            variant="default"
            key={p.id}
            name={p.name}
            gender={p.gender}
            age={p.age ?? "N/A"}
            diagnosis={p.diagnosis || "No medical info added"}
            status={p.status}
            onClick={() =>
              navigate(`/doctor/dashboard/patient-details/${p.id}`)
            }
          />
        ))}
      </div>

      <div ref={loaderRef} style={{ textAlign: "center", padding: "1.5rem 0" }}>
        {isFetching && <Spinner color="green.400" />}
        {!hasMore && patients.length > 0 && (
          <Text color="gray.400" fontSize="sm">All patients loaded</Text>
        )}
      </div>
    </>
  );
}

export default Patients;
