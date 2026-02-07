import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Button, Menu } from "@mui/material";
import { useState } from "react";

export function CustomizedMenu({ title, button, children, ...props }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const TriggerButton = button ?? (
    <Button variant="contained" disableElevation endIcon={<FontAwesomeIcon icon={faChevronDown} />}>
      {title}
    </Button>
  );

  return (
    <Box {...props}>
      <Box onClick={handleClick}>{TriggerButton}</Box>
      <Menu
        id="demo-customized-menu"
        disableScrollLock
        anchorEl={anchorEl}
        open={open}
        onClick={handleClose}
        onClose={handleClose}
      >
        {children}
      </Menu>
    </Box>
  );
}
