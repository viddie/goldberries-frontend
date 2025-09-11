import {
  Button,
  Stack,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { BasicContainerBox, HeadTitle } from "../components/BasicComponents";
import { BigButtonGrid } from "../components/BigButtonGrid";
import { usePostReport } from "../hooks/useApi";
import { FormOptions } from "../util/constants";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Stage Components
function TopicSelectionStage({ topics, selectedTopic, onTopicSelect }) {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        What would you like to report?
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose the main category that best describes your report
      </Typography>
      <BigButtonGrid
        options={Object.keys(topics).map((topicId) => ({
          value: topicId,
          label: topics[topicId].name,
          description: topics[topicId].description,
        }))}
        selectedValue={selectedTopic}
        onSelect={onTopicSelect}
        columns={2}
      />
    </Box>
  );
}

function SubtopicSelectionStage({ topicConfig, selectedSubTopic, onSubtopicSelect, onBack }) {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Select a specific area
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose the specific aspect of "{topicConfig.name}" you want to report
      </Typography>
      <BigButtonGrid
        options={topicConfig.subTopics.map(sub => ({
          value: sub.id,
          label: sub.name,
        }))}
        selectedValue={selectedSubTopic}
        onSelect={onSubtopicSelect}
        columns={2}
      />
      <Box sx={{ mt: 3 }}>
        <Button startIcon={<FontAwesomeIcon icon={faArrowLeft} />} onClick={onBack}>
          Back to Topics
        </Button>
      </Box>
    </Box>
  );
}

function DetailsStage({ form, topicConfig, selectedTopic, selectedSubTopic, onSubmit, onBack, isLoading, canSubmit, t_ff }) {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Provide details
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Selected: {topicConfig?.name || selectedTopic}
        {selectedSubTopic && topicConfig?.subTopics?.find(sub => sub.id === selectedSubTopic)?.name && 
          ` → ${topicConfig.subTopics.find(sub => sub.id === selectedSubTopic).name}`}
      </Typography>

      <form onSubmit={onSubmit}>
        <Stack gap={3}>
          <Controller
            name="url"
            control={form.control}
            rules={topicConfig?.requiresUrl ? FormOptions.UrlRequired(t_ff) : undefined}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label={topicConfig?.requiresUrl ? "URL *" : "URL (optional)"}
                placeholder="https://example.com"
                fullWidth
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ||
                  (topicConfig?.requiresUrl
                    ? "Please provide a URL related to your report"
                    : "Optionally provide a relevant URL")
                }
              />
            )}
          />

          <Controller
            name="message"
            control={form.control}
            rules={{
              required: "Please provide a detailed message",
              minLength: {
                value: 10,
                message: "Message must be at least 10 characters long",
              },
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Message *"
                placeholder="Please describe your report in detail..."
                multiline
                rows={6}
                fullWidth
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.message ||
                  "Provide as much detail as possible to help us understand and address your concern"
                }
              />
            )}
          />

          <Stack direction="row" gap={2} sx={{ justifyContent: "space-between" }}>
            <Button startIcon={<FontAwesomeIcon icon={faArrowLeft} />} onClick={onBack}>
              Back
            </Button>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading || !canSubmit}
              endIcon={isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faArrowRight} />}
            >
              {isLoading ? "Submitting..." : "Submit Report"}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Box>
  );
}

// Topic structure with sub-topics
const TOPICS = {
  "bug-report": {
    name: "Bug Report",
    requiresUrl: true,
    subTopics: [],
    description: "Report technical issues or bugs you've encountered",
  },
  "player": {
    name: "Player",
    requiresUrl: true,
    subTopics: [
      { id: "name", name: "Name" },
      { id: "about-me", name: "About Me" },
      { id: "links", name: "Links" },
      { id: "other", name: "Other" },
    ],
    description: "Issues related to player profiles or information",
  },
  "submission": {
    name: "Submission",
    requiresUrl: true,
    subTopics: [
      { id: "unavailable-video", name: "Unavailable video" },
      { id: "inappropriate-video", name: "Inappropriate video" },
      { id: "unreasonable-difficulty-opinion", name: "Unreasonable difficulty opinion" },
      { id: "other", name: "Other" },
    ],
    description: "Problems with submitted content or videos",
  },
  "other": {
    name: "Other",
    requiresUrl: false,
    subTopics: [],
    description: "General feedback or other inquiries",
  },
};

export function PageReport() {
  const { t: t_ff } = useTranslation(undefined, { keyPrefix: "forms.feedback" });
  const { topic: urlTopic, subtopic: urlSubtopic } = useParams();
  const navigate = useNavigate();
  
  // Decode URL parameters
  const decodedTopic = urlTopic ? decodeURIComponent(urlTopic) : "";
  const decodedSubtopic = urlSubtopic ? decodeURIComponent(urlSubtopic) : "";

  const { mutate: postReport, isLoading } = usePostReport((response) => {
    toast.success("Report submitted successfully!");
    form.reset();
    setCurrentStage(1);
    navigate("/report");
  });

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
        const subtopicExists = topicConfig.subTopics.some(sub => sub.id === decodedSubtopic);
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

  const onSubmit = form.handleSubmit((data) => {
    // Prepare the final topic string using display names
    const topicConfig = TOPICS[data.topic];
    let finalTopic = topicConfig?.name || data.topic;
    
    if (data.subTopic) {
      const subtopicConfig = topicConfig?.subTopics?.find(sub => sub.id === data.subTopic);
      const subtopicName = subtopicConfig?.name || data.subTopic;
      finalTopic = `${finalTopic} - ${subtopicName}`;
    }

    postReport({
      topic: finalTopic,
      message: data.message,
      url: data.url || undefined,
    });
  });

  const canSubmit = !!selectedTopic && (!topicConfig?.subTopics?.length || !!selectedSubTopic) && !!form.getValues("message");

  return (
    <>
      <HeadTitle title="Report" />
      <BasicContainerBox maxWidth="md">
        <Stack gap={4}>
          <Typography variant="h4" component="h1">
            Report
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Use this form to report issues, problems with players or submissions, or provide feedback. Please
            provide as much detail as possible to help us address your concern.
          </Typography>

          {/* Stage 1: Topic Selection */}
          {currentStage === 1 && (
            <TopicSelectionStage
              topics={TOPICS}
              selectedTopic={selectedTopic}
              onTopicSelect={handleTopicSelect}
            />
          )}

          {/* Stage 2: Subtopic Selection */}
          {currentStage === 2 && topicConfig?.subTopics?.length > 0 && (
            <SubtopicSelectionStage
              topicConfig={topicConfig}
              selectedSubTopic={selectedSubTopic}
              onSubtopicSelect={handleSubTopicSelect}
              onBack={handleBack}
            />
          )}

          {/* Stage 3: Details Form */}
          {currentStage === 3 && (
            <DetailsStage
              form={form}
              topicConfig={topicConfig}
              selectedTopic={selectedTopic}
              selectedSubTopic={selectedSubTopic}
              onSubmit={onSubmit}
              onBack={handleBack}
              isLoading={isLoading}
              canSubmit={canSubmit}
              t_ff={t_ff}
            />
          )}
        </Stack>
      </BasicContainerBox>
    </>
  );
}
