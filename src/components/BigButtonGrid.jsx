import { Grid, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledBigButton = styled(Paper)(({ theme, selected }) => ({
  padding: theme.spacing(3),
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  border: selected ? `2px solid ${theme.palette.primary.main}` : "2px solid transparent",
  backgroundColor: selected ? theme.palette.action.selected : theme.palette.background.paper,
  "&:hover": {
    backgroundColor: selected ? theme.palette.action.selected : theme.palette.action.hover,
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4],
  },
}));

export function BigButtonGrid({ options, selectedValue, onSelect, columns = 2 }) {
  return (
    <Grid container spacing={2}>
      {options.map((option) => (
        <Grid item xs={12} sm={6} md={12 / columns} key={option.value || option}>
          <StyledBigButton
            elevation={selectedValue === (option.value || option) ? 3 : 1}
            selected={selectedValue === (option.value || option)}
            onClick={() => onSelect(option.value || option)}
          >
            <Typography
              variant="h6"
              align="center"
              color={selectedValue === (option.value || option) ? "primary.main" : "text.primary"}
              fontWeight={selectedValue === (option.value || option) ? "bold" : "normal"}
            >
              {option.label || option}
            </Typography>
            {option.description && (
              <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1 }}>
                {option.description}
              </Typography>
            )}
          </StyledBigButton>
        </Grid>
      ))}
    </Grid>
  );
}