interface Props {
  search: string;
  setSearch: (value: string) => void;
}

export default function ClienteFilters({
  search,
  setSearch,
}: Props) {
  return (
    <div className="mb-6">
      <input
        placeholder="Buscar cliente..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="w-full border p-3 rounded-lg"
      />
    </div>
  );
}