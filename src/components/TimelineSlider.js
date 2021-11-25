import React, { useEffect, useState, useRef } from 'react'
import { styled } from '@mui/system'
import { withStyles } from '@mui/styles'
import { createTheme } from '@mui/material/styles'
import Slider from '@mui/material/Slider'
import { Button } from '@mui/material'
import PlayArrow from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'

// import { setViewDate } from "../app/slices/covidSlice";
import dayjs from 'dayjs'
const TimelineSlider = ({
  percentToEndDate,
  onChange,
  viewDate,
  dateCount,
  totalDays,
  isPlaying,
  toggleIsPlaying,
  setViewDate
}) => {
  // const [isPlaying, toggleIsPlaying] = useState(false);
  const sliderRef = useRef()

  const TimelineContainer = styled('div')({
    background: 'rgba(50, 50, 50, .5)',
    position: 'absolute',
    zIndex: 1,
    top: '10px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  })

  const SliderContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
    width: '60%',
    justifyContent: 'center'
  })

  const SliderInput = withStyles({
    root: {
      width: '100%',
      marginBottom: 0,
      marginTop: '15px'
    },
    valueLabel: {
      background: '#eaeaea',
      '& span': {
        color: '#000',
        fontSize: '.8rem'
      }
    },
    markLabel: {
      color: '#eaeaea',
      fontSize: '.8rem'
    }
  })(Slider)

  const sliderTheme = createTheme({
    overrides: {
      root: {
        width: '100%'
      },
      valueLabel: {
        background: '#eaeaea',
        '& span': {
          color: '#000'
        }
      },
      markLabel: {
        color: '#eaeaea',
        fontSize: '.6rem'
      }
    }
  })

  // const intervalRef = useRef()
  // const animationRef = useRef()
  // useEffect(() => {
  //   if (isPlaying) {
  //     intervalRef.current = setInterval(() => {
  //       animationRef.current = requestAnimationFrame(() => {
  //         onChange(++dateCount)
  //         let newDate = dayjs('01-22-2020', 'MM-DD-YYYY')
  //           .add(dateCount, 'days')
  //           .format('MM-DD-YYYY')
  //         setViewDate(newDate)
  //       })
  //     }, 200)
  //   } else {
  //     clearInterval(intervalRef.current)
  //   }
  //   return () =>
  //     clearInterval(intervalRef.current) &&
  //     cancelAnimationFrame(animationRef.current)
  // }, [isPlaying])

  const animationRef = useRef()
  const previousTimeRef = useRef()
  useEffect(() => {
    previousTimeRef.current = 0
    if (isPlaying) {
      let animate = currentTime => {
        if (
          !previousTimeRef.current ||
          currentTime - previousTimeRef.current >= 150
        ) {
          onChange(++dateCount)
          let newDate = dayjs('01-22-2020', 'MM-DD-YYYY')
            .add(dateCount, 'days')
            .format('MM-DD-YYYY')
          setViewDate(newDate)
          previousTimeRef.current = currentTime
        }
        animationRef.current = requestAnimationFrame(animate)
      }

      animationRef.current = requestAnimationFrame(animate)
    }
    return () =>
      animationRef.current && cancelAnimationFrame(animationRef.current)
  }, [isPlaying])

  useEffect(() => {
    if (isPlaying && dateCount >= totalDays - 1) {
      toggleIsPlaying()
      cancelAnimationFrame(animationRef.current)
      // clearInterval(intervalRef.current)
    }
  }, [dateCount, totalDays, isPlaying])

  return (
    <TimelineContainer>
      <SliderContainer>
        <SliderInput
          size={'small'}
          theme={sliderTheme}
          sx={{
            color: 'info.main'
          }}
          min={0}
          max={totalDays}
          valueLabelDisplay='on'
          valueLabelFormat={viewDate}
          value={dateCount}
          marks={[
            {
              value: 0,
              label: 'January 22, 2020'
            },
            {
              value: totalDays * 0.25
            },
            {
              value: totalDays * 0.5
            },
            {
              value: totalDays * 0.75
            },
            {
              value: totalDays,
              label: dayjs()
                .subtract(1, 'day')
                .format('MMMM DD, YYYY')
            }
          ]}
          onChange={(event, newValue) => {
            onChange(newValue)
            let newDate = dayjs('01-22-2020', 'MM-DD-YYYY')
            .add(dateCount, 'days')
            .format('MM-DD-YYYY')
            console.log(newValue, newDate)
          setViewDate(newDate)
          }}
        ></SliderInput>
      </SliderContainer>
      <Button
        onClick={() => {
          setTimeout(() => {
            if (isPlaying) {
              cancelAnimationFrame(animationRef.current)
              // clearInterval(intervalRef.current)
            }
            toggleIsPlaying()
          }, 10)
        }}
      >
        {!isPlaying ? (
          <PlayArrow
            color='info'
            sx={{
              fontSize: '2rem',
              '&:hover': {
                cursor: 'pointer'
              }
            }}
          />
        ) : (
          <PauseIcon
            color='info'
            sx={{
              fontSize: '2rem',
              '&:hover': {
                cursor: 'pointer'
              }
            }}
          />
        )}
      </Button>
    </TimelineContainer>
  )
}

export default TimelineSlider

// console.log('newValue', newValue)
