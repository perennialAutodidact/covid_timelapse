import React, { useEffect, useState, useRef } from "react";
import { styled } from "@mui/system";
import { withStyles } from "@mui/styles";
import { createTheme } from "@mui/material/styles";
import Slider from "@mui/material/Slider";
import { Button } from "@mui/material";
import PlayArrow from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

// import { setViewDate } from "../app/slices/covidSlice";
import dayjs from "dayjs";
const TimelineSlider = ({
  percentToEndDate,
  onChange,
  viewDate,
  dateCount,
  totalDays,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const sliderRef = useRef();

  const TimelineContainer = styled("div")({
    background: "rgba(50, 50, 50, .5)",
    position: "absolute",
    zIndex: 1,
    top: "10px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  });

  const SliderContainer = styled("div")({
    display: "flex",
    alignItems: "center",
    width: "60%",
    justifyContent: "center",
  });

  const SliderInput = withStyles({
    root: {
      width: "100%",
      marginBottom: 0,
      marginTop: "15px",
    },
    valueLabel: {
      background: "#eaeaea",
      "& span": {
        color: "#000",
        fontSize: ".8rem",
      },
    },
    markLabel: {
      color: "#eaeaea",
      fontSize: ".8rem",
    },
  })(Slider);

  const sliderTheme = createTheme({
    overrides: {
      root: {
        width: "100%",
      },
      valueLabel: {
        background: "#eaeaea",
        "& span": {
          color: "#000",
        },
      },
      markLabel: {
        color: "#eaeaea",
        fontSize: ".6rem",
      },
    },
  });

  const animationRef = useRef();
  const previousTimeRef = useRef();
  useEffect(() => {
    previousTimeRef.current = 0;
    if (isPlaying) {
      let animate = (currentTime) => {
        if (
          !previousTimeRef.current ||
          currentTime - previousTimeRef.current >= 500
        ) {
          onChange(++dateCount);
          previousTimeRef.current = currentTime;
        }
        animationRef.current = requestAnimationFrame(animate);
      };
      // animate();
      animationRef.current = requestAnimationFrame(animate);
    }
    return () =>
      animationRef.current && cancelAnimationFrame(animationRef.current);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying && dateCount === totalDays) {
      setIsPlaying(false);
      cancelAnimationFrame(animationRef.current);
    }
  }, [dateCount, totalDays, onChange, isPlaying]);

  return (
    <TimelineContainer>
      <Button sx={{ backgroundColor: "primary.main", color: "secondary.main" }} onClick={()=>onChange(++dateCount)}>
        {">"}
      </Button>
      <Button sx={{ backgroundColor: "primary.main", color: "secondary.main" }} onClick={()=>onChange(--dateCount)}>
        {"<"}
      </Button>

      <SliderContainer>
        <SliderInput
          size={"small"}
          theme={sliderTheme}
          sx={{
            color: "info.main",
          }}
          min={0}
          max={totalDays}
          valueLabelDisplay="on"
          valueLabelFormat={viewDate}
          value={dateCount}
          // ref={sliderRef}
          marks={[
            {
              value: 0,
              label: "January 22, 2020",
            },
            {
              value: totalDays * 0.25,
            },
            {
              value: totalDays * 0.5,
            },
            {
              value: totalDays * 0.75,
            },
            {
              value: totalDays,
              label: dayjs().subtract(1, "day").format("MMMM DD, YYYY"),
            },
          ]}
          onChange={(event, newValue) => {
            onChange(newValue);
          }}
        ></SliderInput>
      </SliderContainer>
      <Button onClick={() => {
        cancelAnimationFrame(animationRef.current);
        setIsPlaying(!isPlaying)}}>
        {!isPlaying ? (
          <PlayArrow
            color="info"
            sx={{
              fontSize: "2rem",
              "&:hover": {
                cursor: "pointer",
              },
            }}
          />
        ) : (
          <PauseIcon
            color="info"
            sx={{
              fontSize: "2rem",
              "&:hover": {
                cursor: "pointer",
              },
            }}
          />
        )}
      </Button>
    </TimelineContainer>
  );
};

export default TimelineSlider;

// console.log('newValue', newValue)
