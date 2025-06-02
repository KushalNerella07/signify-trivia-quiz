import {
  Card,
  CardContent,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
} from "@mui/material";
import type { Question } from "../api";

interface Props {
  question: Question;
  selected: string | undefined;
  onSelect: (answer: string) => void;
}

export default function QuestionCard({ question, selected, onSelect }: Props) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {question.questionText}
        </Typography>

        <Box component="form">
          <RadioGroup
            value={selected || ""}
            onChange={(e) => onSelect(e.target.value)}
          >
            {question.choices.map((choice, idx) => (
              <FormControlLabel
                key={idx}
                value={choice}
                control={<Radio />}
                label={choice}
              />
            ))}
          </RadioGroup>
        </Box>
      </CardContent>
    </Card>
  );
}
