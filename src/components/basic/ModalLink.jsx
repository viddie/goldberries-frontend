import { Typography } from "@mui/material";

import { CustomModal, ModalButtons, useModal } from "../../hooks/useModal";

// Muted, underlined text link that opens a dialog with the children as content and a single close button
export function ModalLink({ label, title, maxWidth = "sm", children, sx }) {
  const modal = useModal(null, undefined, { actions: [ModalButtons.close] });

  return (
    <>
      <Typography
        variant="body2"
        component="button"
        type="button"
        onClick={() => modal.open()}
        sx={{
          p: 0,
          border: "none",
          background: "none",
          cursor: "pointer",
          color: "text.secondary",
          textDecoration: "underline",
          "&:hover": { color: "text.primary" },
          ...sx,
        }}
      >
        {label}
      </Typography>
      <CustomModal modalHook={modal} maxWidth={maxWidth} options={{ title }}>
        {children}
      </CustomModal>
    </>
  );
}
