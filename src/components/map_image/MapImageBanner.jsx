import { CustomModal, useModal } from "../../hooks/useModal";
import { API_BASE_URL } from "../../util/constants";
import { PlaceholderImage } from "../PlaceholderImage";

import { MapImageFull } from "./MapImageFull";

const COMMON_STYLE = {
  width: "100%",
  objectPosition: "center",
  cursor: "pointer",
  borderRadius: "4px",
};

export function MapImageBanner({ id, alt, style = {} }) {
  const modalHook = useModal(id);
  return (
    <>
      <PlaceholderImage
        src={API_BASE_URL + "/img/map/" + id + "&scale=2"}
        alt={alt}
        loading="lazy"
        style={{
          ...COMMON_STYLE,
          objectFit: "cover",
          aspectRatio: "6 / 1",
          ...style,
        }}
        onClick={() => modalHook.open(id)}
      />
      <CustomModal modalHook={modalHook} maxWidth={"lg"} options={{ hideFooter: true }}>
        <MapImageFull id={id} onClick={() => modalHook.close()} />
      </CustomModal>
    </>
  );
}
