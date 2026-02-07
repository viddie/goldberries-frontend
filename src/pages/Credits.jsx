import { useTranslation } from "react-i18next";
import { BasicContainerBox, HeadTitle } from "../components/basic";
import { Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";

export function PageCredits() {
  const { t } = useTranslation(undefined, { keyPrefix: "credits" });

  return (
    <BasicContainerBox maxWidth="sm">
      <HeadTitle title={t("title")} />
      <Typography variant="h4">{t("title")}</Typography>
      <Typography variant="body1">{t("text")}</Typography>
      <Table size="small" sx={{ mt: 2 }}>
        <TableBody>
          <TableRow>
            <TableCell width="50%">{t("modelling")}</TableCell>
            <TableCell width="50%">viddie & Yoshi</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t("backend_frontend")}</TableCell>
            <TableCell>viddie</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t("rules")}</TableCell>
            <TableCell>Yoshi and many more people</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t("domain")}</TableCell>
            <TableCell>{t("domain_text", { name: "Reinhardt" })}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t("testing")}</TableCell>
            <TableCell>{t("people")}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t("chinese_translation")}</TableCell>
            <TableCell>Parabones & xyAlone</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t("french_translation")}</TableCell>
            <TableCell>Tomygood & Lee Sin Support</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t("russian_translation")}</TableCell>
            <TableCell>Kurome & Vagrant</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </BasicContainerBox>
  );
}
