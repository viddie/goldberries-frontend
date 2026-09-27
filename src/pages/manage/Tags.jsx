import {
  faArchive,
  faEdit,
  faListOl,
  faPlus,
  faStar,
  faTrash,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import {
  BasicContainerBox,
  CustomIconButton,
  ErrorDisplay,
  HeadTitle,
  LoadingSpinner,
} from "../../components/basic";
import { FormTag } from "../../components/forms/Tag";
import { FormTagCategory } from "../../components/forms/TagCategory";
import { TagChip, getTagCategoryColor, isImplicitTag, useTagLookup } from "../../components/tags";
import { useDeleteTag, useDeleteTagCategory } from "../../hooks/useApi";
import { CustomModal, ModalButtons, useModal } from "../../hooks/useModal";

const CATEGORY_BACKGROUND = "#323232";

export function PageManageTags() {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.tags" });

  return (
    <BasicContainerBox
      maxWidth="lg"
      sx={{ backgroundColor: "#282828", border: "none", p: 0, pt: 0, pb: 0, overflow: "hidden" }}
    >
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <HeadTitle title={t("title")} />
        <Typography variant="h4">{t("title")}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("description")}
        </Typography>
        <ManageTags />
      </Box>
    </BasicContainerBox>
  );
}

//#region ManageTags
function ManageTags() {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.tags" });
  const { query, lookup } = useTagLookup();

  const editCategoryModal = useModal();
  const editTagModal = useModal();
  const { mutate: deleteCategory } = useDeleteTagCategory(() =>
    toast.success(t("feedback.category_deleted")),
  );
  const { mutate: deleteTag } = useDeleteTag(() => toast.success(t("feedback.tag_deleted")));
  const deleteCategoryModal = useModal(null, (cancelled, data) => {
    if (!cancelled) deleteCategory(data.id);
  });
  const deleteTagModal = useModal(null, (cancelled, data) => {
    if (!cancelled) deleteTag(data.id);
  });

  if (query.isLoading) {
    return <LoadingSpinner />;
  } else if (query.isError) {
    return <ErrorDisplay error={query.error} />;
  }

  const categories = lookup.categories;

  const openNewTag = (categoryId) => {
    editTagModal.open({ id: null, category_id: categoryId, values: [] });
  };

  return (
    <Stack direction="column" gap={2}>
      <Button
        variant="contained"
        startIcon={<FontAwesomeIcon icon={faPlus} size="sm" />}
        onClick={() => editCategoryModal.open({ id: null })}
        sx={{ alignSelf: "flex-start" }}
      >
        {t("buttons.create_category")}
      </Button>

      {categories.length === 0 && <Typography variant="body1">{t("no_categories")}</Typography>}

      {categories.map((category) => (
        <CategorySection
          key={category.id}
          category={category}
          onEditCategory={() => editCategoryModal.open(category)}
          onDeleteCategory={() => deleteCategoryModal.open(category)}
          onCreateTag={() => openNewTag(category.id)}
          onEditTag={(tag) => editTagModal.open(tag)}
          onDeleteTag={(tag) => deleteTagModal.open(tag)}
        />
      ))}

      <CustomModal modalHook={editCategoryModal} options={{ hideFooter: true }}>
        {editCategoryModal.data && (
          <FormTagCategory category={editCategoryModal.data} onSave={() => editCategoryModal.close()} />
        )}
      </CustomModal>
      <CustomModal modalHook={editTagModal} options={{ hideFooter: true }} maxWidth="md">
        {editTagModal.data && (
          <FormTag tag={editTagModal.data} categories={categories} onSave={() => editTagModal.close()} />
        )}
      </CustomModal>
      <CustomModal
        modalHook={deleteCategoryModal}
        options={{ title: t("modals.delete_category.title") }}
        actions={[ModalButtons.cancel, ModalButtons.delete]}
      >
        <Typography variant="body1">
          <Trans
            i18nKey="manage.tags.modals.delete_category.description"
            values={{ name: deleteCategoryModal.data?.name ?? "" }}
          />
        </Typography>
      </CustomModal>
      <CustomModal
        modalHook={deleteTagModal}
        options={{ title: t("modals.delete_tag.title") }}
        actions={[ModalButtons.cancel, ModalButtons.delete]}
      >
        <Typography variant="body1">
          <Trans
            i18nKey="manage.tags.modals.delete_tag.description"
            values={{ name: deleteTagModal.data?.name ?? "" }}
          />
        </Typography>
      </CustomModal>
    </Stack>
  );
}
//#endregion

//#region CategorySection
function CategorySection({
  category,
  onEditCategory,
  onDeleteCategory,
  onCreateTag,
  onEditTag,
  onDeleteTag,
}) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.tags" });
  const color = getTagCategoryColor(category);
  const tags = category.tags ?? [];

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1,
        borderLeft: "4px solid " + color,
        backgroundColor: CATEGORY_BACKGROUND,
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
        <Typography variant="h5">{category.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          ({t("sort_label", { sort: category.sort })})
        </Typography>
        {category.is_archived && (
          <Chip size="small" icon={<FontAwesomeIcon icon={faArchive} />} label={t("archived")} />
        )}
        <Box sx={{ flexGrow: 1 }} />
        <ButtonGroup>
          <Tooltip title={t("buttons.create_tag")} arrow>
            <CustomIconButton variant="outlined" onClick={onCreateTag}>
              <FontAwesomeIcon icon={faPlus} />
            </CustomIconButton>
          </Tooltip>
          <Tooltip title={t("buttons.edit_category")} arrow>
            <CustomIconButton variant="contained" onClick={onEditCategory}>
              <FontAwesomeIcon icon={faEdit} />
            </CustomIconButton>
          </Tooltip>
          <Tooltip
            title={tags.length > 0 ? t("delete_category_has_tags") : t("buttons.delete_category")}
            arrow
          >
            <span>
              <CustomIconButton
                variant="outlined"
                color="error"
                onClick={onDeleteCategory}
                disabled={tags.length > 0}
              >
                <FontAwesomeIcon icon={faTrash} />
              </CustomIconButton>
            </span>
          </Tooltip>
        </ButtonGroup>
      </Stack>
      {category.description && (
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
          {category.description}
        </Typography>
      )}

      {tags.length === 0 ? (
        <Typography variant="body2" sx={{ mt: 1 }} fontStyle="italic">
          {t("no_tags")}
        </Typography>
      ) : (
        <TableContainer sx={{ mt: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("table.name")}</TableCell>
                <TableCell>{t("table.values")}</TableCell>
                <TableCell>{t("table.flags")}</TableCell>
                <TableCell width={1} align="center">
                  {t("table.actions")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tags.map((tag) => (
                <TagRow
                  key={tag.id}
                  tag={tag}
                  category={category}
                  onEdit={() => onEditTag(tag)}
                  onDelete={() => onDeleteTag(tag)}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
//#endregion

//#region TagRow
function TagRow({ tag, category, onEdit, onDelete }) {
  const { t } = useTranslation(undefined, { keyPrefix: "manage.tags" });
  const { t: t_ft } = useTranslation(undefined, { keyPrefix: "forms.tag" });

  return (
    <TableRow>
      <TableCell>
        <Typography variant="body1" fontWeight="bold">
          {tag.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" component="div" sx={{ whiteSpace: "pre-line" }}>
          {tag.description}
        </Typography>
      </TableCell>
      <TableCell>
        {isImplicitTag(tag) ? (
          <Typography variant="body2" fontStyle="italic">
            {t("no_qualifiers")}
          </Typography>
        ) : (
          <Stack direction="row" gap={0.5} flexWrap="wrap">
            {tag.values.map((value) => (
              <TagChip key={value.id} tag={tag} value={value} category={category} />
            ))}
          </Stack>
        )}
      </TableCell>
      <TableCell>
        <Stack direction="row" gap={1} alignItems="center" sx={{ whiteSpace: "nowrap" }}>
          <Chip size="small" label={t_ft("selection_mode.options." + tag.selection_mode)} />
          {tag.is_ordinal && (
            <Tooltip title={t_ft("is_ordinal")} arrow>
              <FontAwesomeIcon icon={faListOl} />
            </Tooltip>
          )}
          {tag.is_common && (
            <Tooltip title={t_ft("is_common")} arrow>
              <FontAwesomeIcon icon={faStar} color="#d4a000" />
            </Tooltip>
          )}
          {!tag.is_player_assignable && (
            <Tooltip title={t("team_only")} arrow>
              <FontAwesomeIcon icon={faUserShield} />
            </Tooltip>
          )}
        </Stack>
      </TableCell>
      <TableCell width={1}>
        <ButtonGroup>
          <CustomIconButton variant="contained" onClick={onEdit}>
            <FontAwesomeIcon icon={faEdit} />
          </CustomIconButton>
          <CustomIconButton variant="outlined" color="error" onClick={onDelete}>
            <FontAwesomeIcon icon={faTrash} />
          </CustomIconButton>
        </ButtonGroup>
      </TableCell>
    </TableRow>
  );
}
//#endregion
