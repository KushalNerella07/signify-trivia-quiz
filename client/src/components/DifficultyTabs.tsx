import { Tabs, Tab } from "@mui/material";

interface Props {
  available: Array<"easy" | "medium" | "hard">;
  value: "easy" | "medium" | "hard";
  onChange: (newDiff: "easy" | "medium" | "hard") => void;
}

export default function DifficultyTabs({ available, value, onChange }: Props) {
  const ORDER: Array<"easy" | "medium" | "hard"> = ["easy", "medium", "hard"];

  return (
    <Tabs
      value={value}
      onChange={(_, newValue) => {
        onChange(newValue as "easy" | "medium" | "hard");
      }}
      sx={{ mb: 2 }}
    >
      {ORDER.filter((diff) => available.includes(diff)).map((diff) => (
        <Tab key={diff} label={diff.toUpperCase()} value={diff} />
      ))}
    </Tabs>
  );
}
