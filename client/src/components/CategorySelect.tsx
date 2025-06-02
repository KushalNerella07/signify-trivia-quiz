import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import type { CategoryMeta } from "../api";

interface Props {
  categories: CategoryMeta[];
  value: number | "";
  onChange: (newId: number | "") => void;
}

export default function CategorySelect({ categories, value, onChange }: Props) {
  const handleChange = (e: SelectChangeEvent<number | "">) => {
    onChange(e.target.value);
  };

  return (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel id="category-select-label">Category</InputLabel>
      <Select<number | "">
        labelId="category-select-label"
        value={value}
        label="Category"
        onChange={handleChange}
        renderValue={(val: number | "") => {
          if (val === "") return "Category";
          const found = categories.find((c) => c.apiId === val);
          return found ? found.name : "Category";
        }}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {categories.map((c) => (
          <MenuItem key={c.apiId} value={c.apiId}>
            {c.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
