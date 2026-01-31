import { useState } from "react";
import { Box, Button, Divider, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

/**
 * A clean menu component that handles all state internally.
 *
 * @param {Object} props
 * @param {string} [props.title] - Text for the trigger button (if no custom button provided)
 * @param {React.ReactNode} [props.button] - Custom trigger button element
 * @param {Array} props.items - Array of menu item definitions
 * @param {Object} [props.items[].icon] - FontAwesome icon or React node for the menu item
 * @param {string} props.items[].text - Text label for the menu item
 * @param {Function} props.items[].onClick - Callback function when item is clicked
 * @param {string} [props.items[].color] - MUI color variant (e.g., "error", "primary")
 * @param {boolean} [props.items[].divider] - If true, renders a divider instead of a menu item
 * @param {boolean} [props.items[].disabled] - If true, the menu item is disabled
 * @param {boolean} [props.items[].keepOpen] - If true, keeps the menu open after clicking this item
 *
 * @example
 * <CustomMenu
 *   title="Actions"
 *   items={[
 *     { icon: faEdit, text: "Edit", onClick: handleEdit },
 *     { divider: true },
 *     { icon: faTrash, text: "Delete", onClick: handleDelete, color: "error" },
 *   ]}
 * />
 */
export function CustomMenu({ title, variant = "contained", button, items, ...props }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (item) => {
    if (!item.keepOpen) {
      handleClose();
    }
    if (item.onClick) {
      item.onClick();
    }
  };

  const TriggerButton = button ?? (
    <Button
      variant={variant}
      disableElevation
      endIcon={<FontAwesomeIcon icon={faChevronDown} style={{ fontSize: "0.9em" }} />}
    >
      {title}
    </Button>
  );

  return (
    <Box {...props}>
      <Box onClick={handleClick}>{TriggerButton}</Box>
      <Menu disableScrollLock anchorEl={anchorEl} open={open} onClose={handleClose}>
        {items?.map((item, index) => {
          if (item.divider) {
            return <Divider key={index} sx={{ my: 0.5 }} />;
          }

          const color = item.color ?? "inherit";
          const isIconFontAwesome = item.icon && typeof item.icon === "object" && item.icon.iconName;

          return (
            <MenuItem
              key={index}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              sx={{
                color: item.color ? `${color}.main` : undefined,
                ...(item.color && {
                  transition: "background-color 0.2s",
                  "&:hover": {
                    backgroundColor: (theme) => theme.palette[color]?.main + "33", // 33 = 20% opacity in hex
                  },
                }),
              }}
            >
              {item.icon && (
                <ListItemIcon sx={{ color: item.color ? `${color}.main` : undefined }}>
                  {isIconFontAwesome ? <FontAwesomeIcon icon={item.icon} size="lg" /> : item.icon}
                </ListItemIcon>
              )}
              <ListItemText>{item.text}</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
}
