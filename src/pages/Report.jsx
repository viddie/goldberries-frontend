import {
  Button,
  FormControl,
  FormHelperText,
  Stack,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
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

// Topic structure with sub-topics
const TOPICS = {
  "Bug Report": {
    requiresUrl: true,
    subTopics: [],
    description: "Report technical issues or bugs you've encountered",
  },
  Player: {
    requiresUrl: true,
    subTopics: ["Name", "About Me", "Links", "Other"],
    description: "Issues related to player profiles or information",
  },
  Submission: {
    requiresUrl: true,
    subTopics: ["Unavailable video", "Inappropriate video", "Unreasonable difficulty opinion", "Other"],
    description: "Problems with submitted content or videos",
  },
  Other: {
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
  const requiresUrl = topicConfig?.requiresUrl || false;
  const hasSubTopics = topicConfig?.subTopics?.length > 0;

  // Update stage based on URL parameters and selections
  useEffect(() => {
    if (decodedTopic && TOPICS[decodedTopic]) {
      if (hasSubTopics && decodedSubtopic) {
        setCurrentStage(3);
      } else if (hasSubTopics) {
        setCurrentStage(2);
      } else {
        setCurrentStage(3);
      }
    } else if (decodedTopic) {
      // Invalid topic in URL, reset to stage 1
      navigate("/report");
      setCurrentStage(1);
    }
  }, [decodedTopic, decodedSubtopic, hasSubTopics, navigate]);

  // Handle topic selection
  const handleTopicSelect = (topic) => {
    form.setValue("topic", topic);
    form.setValue("subTopic", "");
    
    const topicConfig = TOPICS[topic];
    if (topicConfig?.subTopics?.length > 0) {
      setCurrentStage(2);
      navigate(`/report/${encodeURIComponent(topic)}`);
    } else {
      setCurrentStage(3);
      navigate(`/report/${encodeURIComponent(topic)}`);
    }
  };

  // Handle subtopic selection
  const handleSubTopicSelect = (subTopic) => {
    form.setValue("subTopic", subTopic);
    setCurrentStage(3);
    navigate(`/report/${encodeURIComponent(selectedTopic)}/${encodeURIComponent(subTopic)}`);
  };

  // Handle back navigation
  const handleBack = () => {
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
    // Prepare the final topic string
    let finalTopic = data.topic;
    if (data.subTopic) {
      finalTopic = `${data.topic} - ${data.subTopic}`;
    }

    postReport({
      topic: finalTopic,
      message: data.message,
      url: data.url || undefined,
    });
  });

  const canSubmit = !!selectedTopic && (!hasSubTopics || !!selectedSubTopic) && !!form.getValues("message");

  // Get the steps for the stepper
  const getSteps = () => {
    const steps = ["Select Topic"];
    if (hasSubTopics) {
      steps.push("Select Subtopic");
    }
    steps.push("Provide Details");
    return steps;
  };

  const steps = getSteps();
  const activeStep = currentStage - 1;

  return (
    <>
      <HeadTitle title="Report" />
      <BasicContainerBox maxWidth="md">
        <Stack spacing={4}>
          <Typography variant="h4" component="h1">
            Report
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Use this form to report issues, problems with players or submissions, or provide feedback. Please
            provide as much detail as possible to help us address your concern.
          </Typography>

          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Stage 1: Topic Selection */}
          {currentStage === 1 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                What would you like to report?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose the main category that best describes your report
              </Typography>
              <BigButtonGrid
                options={Object.keys(TOPICS).map((topic) => ({
                  value: topic,
                  label: topic,
                  description: TOPICS[topic].description,
                }))}
                selectedValue={selectedTopic}
                onSelect={handleTopicSelect}
                columns={2}
              />
            </Box>
          )}

          {/* Stage 2: Subtopic Selection */}
          {currentStage === 2 && hasSubTopics && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Select a specific area
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose the specific aspect of "{selectedTopic}" you want to report
              </Typography>
              <BigButtonGrid
                options={topicConfig.subTopics}
                selectedValue={selectedSubTopic}
                onSelect={handleSubTopicSelect}
                columns={2}
              />
              <Box sx={{ mt: 3 }}>
                <Button startIcon={<FontAwesomeIcon icon={faArrowLeft} />} onClick={handleBack}>
                  Back to Topics
                </Button>
              </Box>
            </Box>
          )}

          {/* Stage 3: Details Form */}
          {currentStage === 3 && (
            <Box>
              <Typography variant="h5" gutterBottom>
                Provide details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Selected: {selectedTopic}
                {selectedSubTopic && ` → ${selectedSubTopic}`}
              </Typography>

              <form onSubmit={onSubmit}>
                <Stack gap={3}>
                  <Controller
                    name="url"
                    control={form.control}
                    rules={requiresUrl ? FormOptions.UrlRequired(t_ff) : undefined}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label={requiresUrl ? "URL *" : "URL (optional)"}
                        placeholder="https://example.com"
                        fullWidth
                        error={!!fieldState.error}
                        helperText={
                          fieldState.error?.message ||
                          (requiresUrl
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

                  <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between" }}>
                    <Button startIcon={<FontAwesomeIcon icon={faArrowLeft} />} onClick={handleBack}>
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
          )}
        </Stack>
      </BasicContainerBox>
    </>
  );
}
