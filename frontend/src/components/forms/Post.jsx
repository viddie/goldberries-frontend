import { useQuery } from "react-query";
import { fetchPost } from "../../util/api";
import {
  Button,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ErrorDisplay, HeadTitle, LoadingSpinner, StyledLink } from "../BasicComponents";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useEffect, useMemo } from "react";
import { getQueryData, usePostPost } from "../../hooks/useApi";
import { useTranslation } from "react-i18next";
import { MarkdownRenderer, PostImage, PostTitle } from "../../pages/Post";
import { useDebounce, useLocalStorage } from "@uidotdev/usehooks";
import { useAuth } from "../../hooks/AuthProvider";
import { useNavigate } from "react-router-dom";

export function FormPostWrapper({ id, onSave, ...props }) {
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const query = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(id),
    // staleTime: 0,
    // cacheTime: 0,
    enabled: id !== null,
  });

  const [storedPost, setStoredPost] = useLocalStorage("new_post", {
    id: null,
    type: "news",
    image_url: "",
    title: "",
    content: "",
  });

  const data = getQueryData(query);
  const post = useMemo(() => {
    return id !== null ? data : storedPost;
  }, [data]);

  if (query.isLoading) {
    return (
      <>
        <Typography variant="h6">
          {t_g("post", { count: 1 })} ({id})
        </Typography>
        <LoadingSpinner />
      </>
    );
  } else if (query.isError) {
    return (
      <>
        <Typography variant="h6">
          {t_g("post", { count: 1 })} ({id})
        </Typography>
        <ErrorDisplay error={query.error} />
      </>
    );
  }

  return <FormPost post={post} setStoredPost={setStoredPost} onSave={onSave} {...props} />;
}

export function FormPost({ post, setStoredPost, onSave, ...props }) {
  const { t } = useTranslation(undefined, { keyPrefix: "forms.post" });
  const { t: t_g } = useTranslation(undefined, { keyPrefix: "general" });
  const auth = useAuth();
  const navigate = useNavigate();

  const newPost = post.id === null;

  const { mutate: savePost } = usePostPost((data) => {
    toast.success(t(newPost ? "feedback.created" : "feedback.updated"));
    if (onSave) onSave(data);
  });
  const gotoPost = () => {
    navigate(`/${post.type}/${post.id}`);
  };

  const form = useForm({
    defaultValues: {
      ...post,
    },
  });
  const onUpdateSubmit = form.handleSubmit((data) => {
    savePost(data);
  });
  useEffect(() => {
    form.reset(post);
  }, [post]);

  const formPost = form.watch();

  useEffect(() => {
    if (newPost) {
      setStoredPost(formPost);
    }
  }, [formPost]);

  const imageUrlDebounced = useDebounce(formPost.image_url, 500);

  const pageTitle = newPost ? t_g("new") : post.title;

  return (
    <form {...props}>
      <HeadTitle title={`Edit Post '${pageTitle}'`} />
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="h6" gutterBottom flex="1">
          {t_g("post", { count: 1 })} ({newPost ? t_g("new") : "ID: " + post.id})
        </Typography>
        {!newPost && (
          <Button variant="outlined" onClick={gotoPost}>
            {t("buttons.goto")}
          </Button>
        )}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid item xs={12} lg={5}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="type"
                control={form.control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>{t("type")}</InputLabel>
                    <Select
                      label={t("type")}
                      fullWidth
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <MenuItem value="news">{t("types.news")}</MenuItem>
                      <MenuItem value="changelog" disabled={!auth.hasAdminPriv}>
                        {t("types.changelog")}
                      </MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField label={t("image_url")} sx={{ mt: 2 }} fullWidth {...form.register("image_url")} />
            </Grid>
            <Grid item xs={12}>
              <TextField label={t("title")} sx={{ mt: 2 }} fullWidth {...form.register("title")} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t("content")}
                sx={{ mt: 2 }}
                multiline
                fullWidth
                {...form.register("content")}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} lg={7}>
          <Grid container spacing={1}>
            {imageUrlDebounced && (
              <Grid item xs={12} sx={{ mt: 1 }}>
                <PostImage image_url={imageUrlDebounced} title={formPost.title} />
              </Grid>
            )}
            <Grid item xs={12} sx={{ "&&": { pt: 0 } }}>
              <PostTitle title={formPost.title} />
            </Grid>
            <Grid item xs={12} sx={{ "& > :first-child": { mt: 0 }, "& > :last-child": { mb: 0 } }}>
              <MarkdownRenderer markdown={formPost.content} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Button
        variant="contained"
        fullWidth
        color={newPost ? "success" : "primary"}
        onClick={onUpdateSubmit}
        disabled={formPost.title === "" || formPost.content === ""}
      >
        {t(newPost ? "buttons.create" : "buttons.update")}
      </Button>
    </form>
  );
}
