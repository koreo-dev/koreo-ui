import { styled } from "@mui/material/styles";
import Link from "next/link";

const StyledLink = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: "none",
  "&:hover": {
    color: theme.palette.primary.dark,
    textDecoration: "underline",
  },
}));

export default StyledLink;

