import { MenuItem, TextField } from "@mui/material";
import { useQuery } from "react-query";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import { fetchAllObjectives } from "../../util/api";
import { getObjectiveName } from "../../util/data_util";


export function ObjectiveSelect({ objectiveId, setObjectiveId, ...props }) {
  const { t } = useTranslation();
  const query = useQuery({
    queryKey: ["all_objectives"],
    queryFn: () => fetchAllObjectives(),
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const objectives = query.data?.data ?? [];
  objectives.sort((a, b) => a.id - b.id);

  return (
    <TextField
      {...props}
      label={t("general.objective", { count: 1 })}
      select
      value={objectiveId ?? 1}
      onChange={(e) => setObjectiveId(e.target.value)}
      SelectProps={{
        ...props.SelectProps,
        MenuProps: { disableScrollLock: true },
      }}
    >
      {objectives.map((objective) => (
        <MenuItem key={objective.id} value={objective.id}>
          {getObjectiveName(objective)}
        </MenuItem>
      ))}
    </TextField>
  );
}
