
import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  Button,
  Box,
  TextField,
  Stack,
  Typography,
  Paper,
  Divider,
  MenuItem,
  IconButton,
  Link,
  Collapse,
  Grow,
  Fade,
  CircularProgress,
  FormControlLabel,
  Switch,
  Tooltip
} from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { createDockerDesktopClient } from '@docker/extension-api-client';
import InfoIcon from '@mui/icons-material/Info';
export function CopaInput(props: any) {

  const ddClient = createDockerDesktopClient();
  const [dockerImages, setDockerImages] = useState([] as string[]);
  const [selectedImageError, setSelectedImageError] = useState(false);
  const [selectedImageHelperText, setSelectedImageHelperText] = useState("");
  const [selectImageLabel, setSelectImageLabel] = useState("Remote Images");

  const fetchData = async () => {
    const imagesList = await ddClient.docker.listImages();
    const listImages = (imagesList as []).map((images: any) => images.RepoTags)
      .sort()
      .filter((images: any) => images && "<none>:<none>" !== images[0])
      .flat();

    if (listImages.length == 0) {

    }
    setDockerImages(listImages);
  }

  useEffect(() => {
    props.setSelectedImage("");
    if (props.useContainerdChecked) {
      fetchData();
      setSelectImageLabel("Local Image / Remote Image");
    } else {
      setDockerImages([]);
      setSelectImageLabel("Remote Image")
    }
  }, [props.useContainerdChecked]);

  const hasWhiteSpace = (s: string) => {
    return s.indexOf(' ') >= 0;
  }

  const validateInput = () => {
    let foundError: boolean = false;
    if (props.selectedImage === null || props.selectedImage.length === 0) {
      foundError = true;
      setSelectedImageHelperText("Image input can not be empty.");
    } else if (hasWhiteSpace(props.selectedImage)) {
      foundError = true;
      setSelectedImageHelperText("Image input can not have whitespace.")
    } else {

      let seperateSplit = props.selectedImage.split(':');
      let numColons = seperateSplit.length - 1;

      if (numColons > 1) {
        foundError = true;
        setSelectedImageHelperText("Image input can only have one colon.");
      } else {
        if (seperateSplit[0].length === 0) {
          foundError = true;
          setSelectedImageHelperText("Image input can not be a tag only.")
        }
      }
    }
    if (foundError) {
      setSelectedImageError(true);
    } else {
      setSelectedImageError(false);
      props.patchImage();
    }

  }

  const handleLocalImageSwitchChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.setUseContainerdChecked(event.target.checked);
  };

  return (
    <Stack spacing={2}>
      <Autocomplete
        freeSolo
        disablePortal
        value={props.selectedImage}
        onInputChange={(event: any, newValue: string | null) => {
          props.setSelectedImage(newValue);
          if (newValue !== null) { 
            const seperateSplit = newValue?.split(':');
            const numColons = seperateSplit.length - 1;
            if (numColons === 0) { 
              props.setImageName(newValue + ":latest");
            } else {
              props.setImageName(newValue);
            }
          }
        }}
        id="image-select-combo-box"
        options={dockerImages}
        sx={{ width: 300 }}
        renderInput={(params) =>
          <TextField
            {...params}
            label={selectImageLabel}
            error={selectedImageError}
            helperText={selectedImageHelperText}
          />}
      />
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label" variant='outlined'>Scanner</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={props.selectedScanner}
          label="Scanner"
          onChange={(event: SelectChangeEvent) => {
            props.setSelectedScanner(event.target.value as string);
          }}
        >
          <MenuItem value={"trivy"}>Trivy</MenuItem>
        </Select>
      </FormControl>
      <Collapse in={props.inSettings}>
        <Grow in={props.inSettings}>
          <Stack spacing={2}>
            <TextField
              id="image-tag-input"
              label="Patched Image Tag"
              value={props.selectedImageTag}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                props.setSelectedImageTag(event.target.value);
              }}
            />
            <TextField
              id="timeout-input"
              label="Timeout"
              value={props.selectedTimeout}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                props.setSelectedTimeout(event.target.value);
              }}
            />
            <Stack direction="row">
              <FormControlLabel control={
                <Switch
                  checked={props.useContainerdChecked}
                  onChange={handleLocalImageSwitchChecked}
                />
              } label="Using containerd image store" />
              <Tooltip title={"Turn on if using containerd image store, which allows patching of "
                + "local images (i.e. built or tagged locally but not pushed to a registry)."}>
                <IconButton onClick={() => {
                  ddClient.host.openExternal("https://docs.docker.com/desktop/containerd/")
                }}>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Grow>
      </Collapse>
      <Stack direction="row" spacing={2}>
        <Button onClick={validateInput}>Patch image</Button>
        <Button onClick={() => {
          props.setInSettings(!props.inSettings);
        }} >Settings</Button>
      </Stack>
    </Stack>
  )
}
