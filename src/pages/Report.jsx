import {
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import {
  BasicContainerBox,
  HeadTitle,
} from "../components/BasicComponents";
import { postReport } from "../util/api";

// Topic structure with sub-topics
const TOPICS = {
  "Bug Report": {
    requiresUrl: true,
    subTopics: [],
  },
  "Player": {
    requiresUrl: true,
    subTopics: ["Name", "About Me", "Links"],
  },
  "Submission": {
    requiresUrl: true,
    subTopics: ["Unavailable video", "Inappropriate video", "Unreasonable difficulty opinion"],
  },
  "Other": {
    requiresUrl: false,
    subTopics: [],
  },
};

export function PageReport() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      topic: "",
      subTopic: "",
      message: "",
      url: "",
    },
  });

  const selectedTopic = form.watch("topic");
  const topicConfig = TOPICS[selectedTopic];
  const requiresUrl = topicConfig?.requiresUrl || false;
  const hasSubTopics = topicConfig?.subTopics?.length > 0;

  // Reset sub-topic when topic changes
  const handleTopicChange = (topic) => {
    form.setValue("topic", topic);
    form.setValue("subTopic", "");
  };

  const onSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      // Prepare the final topic string
      let finalTopic = data.topic;
      if (data.subTopic) {
        finalTopic = `${data.topic} - ${data.subTopic}`;
      }

      await postReport({
        topic: finalTopic,
        message: data.message,
        url: data.url || undefined,
      });

      toast.success("Report submitted successfully!");
      form.reset();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <>
      <HeadTitle title="Report" />
      <BasicContainerBox maxWidth="md">
        <Stack spacing={3}>
          <Typography variant="h4" component="h1">
            Report
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            Use this form to report issues, problems with players or submissions, or provide feedback.
            Please provide as much detail as possible to help us address your concern.
          </Typography>

          <form onSubmit={onSubmit}>
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={hasSubTopics ? 6 : 12}>
                  <Controller
                    name="topic"
                    control={form.control}
                    rules={{ required: "Please select a topic" }}
                    render={({ field, fieldState }) => (
                      <FormControl fullWidth error={!!fieldState.error}>
                        <InputLabel>Topic *</InputLabel>
                        <Select
                          {...field}
                          label="Topic *"
                          onChange={(e) => handleTopicChange(e.target.value)}
                        >
                          {Object.keys(TOPICS).map((topic) => (
                            <MenuItem key={topic} value={topic}>
                              {topic}
                            </MenuItem>
                          ))}
                        </Select>
                        {fieldState.error && (
                          <FormHelperText>{fieldState.error.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                {hasSubTopics && (
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="subTopic"
                      control={form.control}
                      rules={{ required: "Please select a sub-topic" }}
                      render={({ field, fieldState }) => (
                        <FormControl fullWidth error={!!fieldState.error}>
                          <InputLabel>Sub-topic *</InputLabel>
                          <Select {...field} label="Sub-topic *">
                            {topicConfig.subTopics.map((subTopic) => (
                              <MenuItem key={subTopic} value={subTopic}>
                                {subTopic}
                              </MenuItem>
                            ))}
                          </Select>
                          {fieldState.error && (
                            <FormHelperText>{fieldState.error.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>
                )}
              </Grid>

              <Controller
                name="url"
                control={form.control}
                rules={{
                  required: requiresUrl ? "URL is required for this topic" : false,
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: "Please enter a valid URL starting with http:// or https://",
                  },
                }}
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

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{ alignSelf: "flex-start" }}
              >
                {isSubmitting ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: 8 }} />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </Stack>
          </form>
        </Stack>
      </BasicContainerBox>
    </>
  );
}