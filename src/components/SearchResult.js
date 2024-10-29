import "../style/SearchResult.css";

export const SearchResult = ({ result, setUsers, users }) => {
  return (
    <div
      className="search-result"
      onClick={(e) => {
        const userExists = users.some((user) => user.email === result.email);
  
        if (!userExists) {
          setUsers((prevUsers) => [...prevUsers, result]);
        }
      }}
    >
      {result.email} | {result.firstName} {result.lastName}
    </div>
  );
};