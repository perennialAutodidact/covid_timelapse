import React, { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { styled } from "@mui/system";
import { withStyles } from "@mui/styles";
import Slider from "@mui/material/Slider";
import PlayArrow from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

const TimelineSlider = ({
  percentToEndDate,
  onChange,
  viewDate,
  dateCount,
  totalDays,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
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
  })(Slider);

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
          onChange();
          previousTimeRef.current = currentTime;
        }
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    }
    return () =>
      animationRef.current && cancelAnimationFrame(animationRef.current);
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying && dateCount === totalDays) {
      setIsPlaying(false);
      cancelAnimationFrame(animationRef.current);
    }
  }, [dateCount, totalDays, animationRef.current]);

  return (
    <TimelineContainer>
      {!isPlaying ? (
        <PlayArrow
          color="info"
          sx={{
            fontSize: "2rem",
            "&:hover": {
              cursor: "pointer",
            },
          }}
          onClick={() => setIsPlaying(!isPlaying)}
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
          onClick={() => setIsPlaying(!isPlaying)}
        />
      )}
      <SliderContainer>
        <SliderInput
          sx={{
            color: "info.main",
          }}
          min={0}
          max={totalDays}
          valueLabelDisplay="on"
          valueLabelFormat={viewDate}
          value={dateCount}
          ref={sliderRef}
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
            // console.log('newValue', newValue)
            onChange(newValue);
          }}
        ></SliderInput>
      </SliderContainer>
    </TimelineContainer>
  );
};

//
//
//
//

const CountDates = () => {
  const [state, setState] = useState({
    dateCount: 0,
    totalDays: dayjs()
      .subtract(1, "day")
      .diff(dayjs("01-22-2020", "MM-DD-YYYY"), "days"),
    startDate: "01-22-2020",
    endDate: dayjs().subtract(1, "day").format("MM-DD-YYYY"),
    viewDate: "01-22-2020",
  });

  const setDateCount = (newCount) => {
    setState((state) => ({
      ...state,
      dateCount: newCount || state.dateCount++,
    }));
  };

  useEffect(() => {
    setState((state) => ({
      ...state,
      viewDate: dayjs(state.startDate, "MM-DD-YYYY")
        .add(state.dateCount, "days")
        .format("MM-DD-YYYY"),
    }));
  }, [state.dateCount]);

  return (
    <>
      <TimelineSlider
        dateCount={state.dateCount}
        totalDays={state.totalDays}
        onChange={setDateCount}
        viewDate={state.viewDate}
      />
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </>
  );
};

export default CountDates;
