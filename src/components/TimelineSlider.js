import React from 'react'
import { styled } from '@mui/system';
import { withStyles } from '@mui/styles';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import PlayArrowTwoToneIcon from '@mui/icons-material/PlayArrowTwoTone'
import PauseIcon from '@mui/icons-material/Pause'
import { pink } from '@mui/material/colors';

const TimelineSlider = () => {
  const TimelineContainer = styled('div')({
    position: 'absolute',
    zIndex: 1,
    top: '40px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  })

  const SliderInput = withStyles({
    root: {
      marginLeft: 12,
      width: '60%',
    },
    valueLabel: {
      '& span': {
        background: 'none',
        color: '#000'
      }
    }
  })(Slider);

  return (
    <TimelineContainer>
      <PlayArrowTwoToneIcon color="success" sx={{
        padding: '0px 15px'
      }}/>
      <SliderInput
      sx={{
        color: 'success.main'
      }}>
      </SliderInput>
    </TimelineContainer>
  )
}

export default TimelineSlider
