import { Button, Stack, TextField, Typography, Box } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { BasicContainerBox, HeadTitle, StyledLink } from "../components/BasicComponents";
import { BigButtonGrid } from "../components/BigButtonGrid";
import { usePostReport } from "../hooks/useApi";
import { FormOptions } from "../util/constants";
import { useTranslation, Trans } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/AuthProvider";

// Topic structure with sub-topics
const TOPICS = {
  bug: {
    requiresUrl: true,
    subTopics: [],
  },
  player: {
    requiresUrl: true,
    subTopics: [{ id: "name" }, { id: "about-me" }, { id: "links" }, { id: "other" }],
  },
  submission: {
    requiresUrl: true,
    subTopics: [
      { id: "unavailable-video" },
      { id: "inappropriate-video" },
      { id: "difficulty-opinion" },
      { id: "other" },
    ],
  },
  other: {
    requiresUrl: false,
    subTopics: [],
  },
};

export function PageReport() {
  const { topic: urlTopic, subtopic: urlSubtopic } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(undefined, { keyPrefix: "report" });
  const auth = useAuth();

  // Check if user is logged in and has a player claimed
  const canSubmitReport = auth.isLoggedIn && auth.hasPlayerClaimed;

  // Decode URL parameters
  const decodedTopic = urlTopic ? decodeURIComponent(urlTopic) : "";
  const decodedSubtopic = urlSubtopic ? decodeURIComponent(urlSubtopic) : "";

  const form = useForm({
    defaultValues: {
      topic: decodedTopic,
      subTopic: decodedSubtopic,
      message: "",
      url: "",
    },
  });

  const [currentStage, setCurrentStage] = useState(1);

  const selectedTopic = form.watch("topic");
  const selectedSubTopic = form.watch("subTopic");
  const topicConfig = TOPICS[selectedTopic];

  // Update stage based on URL parameters and selections
  useEffect(() => {
    if (decodedTopic && TOPICS[decodedTopic]) {
      const topicConfig = TOPICS[decodedTopic];
      if (topicConfig.subTopics.length > 0 && decodedSubtopic) {
        // Check if subtopic exists
        const subtopicExists = topicConfig.subTopics.some((sub) => sub.id === decodedSubtopic);
        if (subtopicExists) {
          setCurrentStage(3);
        } else {
          setCurrentStage(2);
        }
      } else if (topicConfig.subTopics.length > 0) {
        setCurrentStage(2);
      } else {
        setCurrentStage(3);
      }
    } else if (decodedTopic) {
      // Invalid topic in URL, reset to stage 1
      navigate("/report");
      setCurrentStage(1);
    }
  }, [decodedTopic, decodedSubtopic, navigate]);

  // Handle topic selection
  const handleTopicSelect = (topicId) => {
    form.setValue("topic", topicId);
    form.setValue("subTopic", "");

    const topicConfig = TOPICS[topicId];
    if (topicConfig?.subTopics?.length > 0) {
      setCurrentStage(2);
      navigate(`/report/${encodeURIComponent(topicId)}`);
    } else {
      setCurrentStage(3);
      navigate(`/report/${encodeURIComponent(topicId)}`);
    }
  };

  // Handle subtopic selection
  const handleSubTopicSelect = (subTopicId) => {
    form.setValue("subTopic", subTopicId);
    setCurrentStage(3);
    navigate(`/report/${encodeURIComponent(selectedTopic)}/${encodeURIComponent(subTopicId)}`);
  };

  // Handle back navigation
  const handleBack = () => {
    const topicConfig = TOPICS[selectedTopic];
    const hasSubTopics = topicConfig?.subTopics?.length > 0;

    if (currentStage === 3 && hasSubTopics) {
      setCurrentStage(2);
      navigate(`/report/${encodeURIComponent(selectedTopic)}`);
    } else if (currentStage === 2 || (currentStage === 3 && !hasSubTopics)) {
      setCurrentStage(1);
      navigate("/report");
      form.setValue("topic", "");
      form.setValue("subTopic", "");
    }
  };

  // Handle form reset
  const handleResetForm = () => {
    form.reset({
      topic: "",
      subTopic: "",
      message: "",
      url: "",
    });
    setCurrentStage(1);
    navigate("/report");
  };

  return (
    <>
      <HeadTitle title={t("title")} />
      <BasicContainerBox maxWidth="md">
        <Stack gap={4}>
          <Typography variant="h4" component="h1">
            {t("title")}
          </Typography>

          <Typography variant="body1" color="text.secondary">
            {t("description")}
          </Typography>

          {/* Show message if user cannot submit reports */}
          {!canSubmitReport && (
            <Typography variant="body1" color="text.secondary">
              <Trans
                i18nKey="report.need_player"
                components={{ CustomLink: <StyledLink to="/player/claim" /> }}
              />
            </Typography>
          )}

          {/* Only show stages if user can submit reports */}
          {canSubmitReport && (
            <>
              {/* Stage 1: Topic Selection */}
              {currentStage === 1 && (
                <TopicSelectionStage
                  topics={TOPICS}
                  selectedTopic={selectedTopic}
                  onTopicSelect={handleTopicSelect}
                  t={t}
                />
              )}

              {/* Stage 2: Subtopic Selection */}
              {currentStage === 2 && topicConfig?.subTopics?.length > 0 && (
                <SubtopicSelectionStage
                  topicConfig={topicConfig}
                  selectedTopic={selectedTopic}
                  selectedSubTopic={selectedSubTopic}
                  onSubtopicSelect={handleSubTopicSelect}
                  onBack={handleBack}
                  t={t}
                />
              )}

              {/* Stage 3: Details Form */}
              {currentStage === 3 && (
                <DetailsStage
                  form={form}
                  topicConfig={topicConfig}
                  selectedTopic={selectedTopic}
                  selectedSubTopic={selectedSubTopic}
                  onBack={handleBack}
                  onResetForm={handleResetForm}
                />
              )}
            </>
          )}
        </Stack>
      </BasicContainerBox>
    </>
  );
}

// Stage Components
function TopicSelectionStage({ topics, selectedTopic, onTopicSelect, t }) {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t("stages.topic_selection.title")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("stages.topic_selection.description")}
      </Typography>
      <BigButtonGrid
        options={Object.keys(topics).map((topicId) => ({
          value: topicId,
          label: t(`topics.${topicId}.name`),
          description: t(`topics.${topicId}.description`),
        }))}
        selectedValue={selectedTopic}
        onSelect={onTopicSelect}
        columns={2}
      />
    </Box>
  );
}

function SubtopicSelectionStage({
  topicConfig,
  selectedTopic,
  selectedSubTopic,
  onSubtopicSelect,
  onBack,
  t,
}) {
  const topicName = t(`topics.${selectedTopic}.name`);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t("stages.subtopic_selection.title")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("stages.subtopic_selection.description", { topic: topicName })}
      </Typography>
      <BigButtonGrid
        options={topicConfig.subTopics.map((sub) => ({
          value: sub.id,
          label: t(`topics.${selectedTopic}.subtopics.${sub.id}.name`),
        }))}
        selectedValue={selectedSubTopic}
        onSelect={onSubtopicSelect}
        columns={2}
      />
      <Box sx={{ mt: 3 }}>
        <Button startIcon={<FontAwesomeIcon icon={faArrowLeft} />} onClick={onBack}>
          {t("buttons.back_to_topics")}
        </Button>
      </Box>
    </Box>
  );
}

function DetailsStage({ form, topicConfig, selectedTopic, selectedSubTopic, onBack, onResetForm }) {
  const { t } = useTranslation(undefined, { keyPrefix: "report.stages.details" });
  const { t: t_r } = useTranslation(undefined, { keyPrefix: "report" });
  const { t: t_rb } = useTranslation(undefined, { keyPrefix: "report.buttons" });
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });

  const topicName = t_r(`topics.${selectedTopic}.name`);

  const { mutate: postReport, isLoading } = usePostReport((response) => {
    toast.success(t("feedback.success"));
    onResetForm();
  });

  const onSubmit = form.handleSubmit((data) => {
    // Prepare the final topic string using display names
    const topicName = t(`topics.${data.topic}.name`);
    let finalTopic = topicName;

    if (data.subTopic) {
      const subtopicName = t(`topics.${data.topic}.subtopics.${data.subTopic}.name`);
      finalTopic = `${finalTopic} - ${subtopicName}`;
    }

    postReport({
      topic: finalTopic,
      message: data.message,
      url: data.url || undefined,
    });
  });

  const message = form.watch("message");
  const url = form.watch("url");
  const canSubmit =
    !!selectedTopic &&
    (!topicConfig?.subTopics?.length || !!selectedSubTopic) &&
    !!message &&
    message.length >= 3;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {t("title")}
      </Typography>
      <Stack direction="row" gap={1} sx={{ mb: 3 }} alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {t("selected_label", { topic: topicName })}
        </Typography>
        {selectedSubTopic && (
          <>
            <FontAwesomeIcon icon={faArrowRight} />
            <Typography variant="body2" color="text.secondary">
              {t_r(`topics.${selectedTopic}.subtopics.${selectedSubTopic}.name`)}
            </Typography>
          </>
        )}
      </Stack>

      <form onSubmit={onSubmit}>
        <Stack gap={3}>
          <Controller
            name="url"
            control={form.control}
            rules={topicConfig?.requiresUrl ? FormOptions.UrlRequired(t_ff) : undefined}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label={topicConfig?.requiresUrl ? t("url_label") : t("url_label_optional")}
                fullWidth
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ||
                  (topicConfig?.requiresUrl ? t("url_required_help") : t("url_optional_help"))
                }
              />
            )}
          />

          <Controller
            name="message"
            control={form.control}
            rules={{
              required: t("validation.message_required"),
              minLength: {
                value: 3,
                message: t("validation.message_min_length"),
              },
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label={t("message_label")}
                placeholder={t("message_placeholder")}
                multiline
                rows={6}
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message || t("message_help")}
              />
            )}
          />

          <Stack direction="row" gap={2} sx={{ justifyContent: "space-between" }}>
            <Button startIcon={<FontAwesomeIcon icon={faArrowLeft} />} onClick={onBack}>
              {t_rb("back")}
            </Button>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading || !canSubmit}
              endIcon={
                isLoading ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <FontAwesomeIcon icon={faArrowRight} />
                )
              }
            >
              {isLoading ? t_rb("submitting") : t_rb("submit")}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Box>
  );
}
