# Covid Timelapse
A timelapse visualization of US Covid-19 data provided by the Center for Systems Science and Engineering (CSSE) at Johns Hopkins University 

<img src='./covidtimelapse.gif' width=800/>


The UI is still a bit buggy at times:

- data is lazy-loaded in chunks so if the timeline goes faster than the data is loaded, no data will be displayed. All the data will be available on the second pass.
- The play/pause button needs multiple clicks in quick succession to stop the timeline. I believe this is due to Reacts event loop, but I haven't figured out how to stop it from happening yet.
## Concepts Learned
- CSV manipulation from URL
- Dealing with large amounts of data (Over 1,000,000 datapoints and counting)
- DeckGL layers and animations 
- `requestAnimationFrame()` loops in React
- `useEffect()` vs `useLayoutEffect()`
- Web worker implementation for processing CSV data
- Memoization with `useMemo()` and `useCallback()` hooks