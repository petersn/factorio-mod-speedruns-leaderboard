import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import 'moment-timezone';

const COMPETITION_START_DAY = moment.tz('2023-10-19 00:00', 'America/Los_Angeles');

const COLORS: string[] = [
  '#1f77b4',
  '#ff7f0e',
  '#2ca02c',
  '#d62728',
  '#9467bd',
  '#8c564b',
  '#e377c2',
  '#7f7f7f',
  '#bcbd22',
  '#17becf',
];

interface Run {
  runner: string;
  timestamp: string;
  // Hours, minutes, seconds
  time: [number, number, number];
  link: string;
  chosenItem: string;
}

function runToSeconds(run: Run): number {
  const [hours, minutes, seconds] = run.time;
  return hours * 3600 + minutes * 60 + seconds;
}

interface Rewards {
  dollars: number;
  firsts: number;
  seconds: number;
  thirds: number;
}

const RUNS: Run[] = [
  {
    runner: 'Ximoltus',
    timestamp: '2023-10-18 15:42',
    time: [2, 0, 39],
    link: 'https://www.twitch.tv/videos/1954434786',
    chosenItem: 'Rocket_silo.png',
  },
  {
    runner: 'Pitta',
    timestamp: '2023-10-18 15:46',
    time: [2, 5, 24],
    link: 'https://www.twitch.tv/videos/1954437640',
    chosenItem: 'Rocket_silo.png',
  },
  {
    runner: 'Zaspar',
    timestamp: '2023-10-18 18:05',
    time: [1, 51, 44],
    link: 'https://www.twitch.tv/videos/1954545251',
    chosenItem: 'Rocket_silo.png',
  },
  {
    runner: 'Zaspar',
    timestamp: '2023-10-19 15:51',
    time: [1, 43, 42],
    link: 'https://www.twitch.tv/videos/1955238304',
    chosenItem: 'Rocket_silo.png',
  },
  {
    runner: 'Zaspar',
    timestamp: '2023-10-27 15:01',
    time: [1, 33, 22],
    link: 'https://www.twitch.tv/videos/1961934728',
    chosenItem: 'Rocket_silo.png',
  },
  {
    runner: 'Zaspar',
    timestamp: '2023-10-28 08:01',
    time: [1, 23, 45],
    link: 'https://www.twitch.tv/videos/1962499677',
    chosenItem: 'Rocket_silo.png',
  },
  {
    runner: 'Zaspar',
    timestamp: '2023-10-29 17:48',
    time: [1, 23,  9],
    link: 'https://www.twitch.tv/videos/1963806432',
    chosenItem: 'Rocket_silo.png',
  },
  {
    runner: 'Ximoltus',
    timestamp: '2023-11-05 17:15',
    time: [1, 37, 35],
    link: 'https://www.twitch.tv/videos/1969912655',
    chosenItem: 'Rocket_silo.png',
  },
];

function timestampToMoment(timestamp: string): moment.Moment {
  // We interpret the timestamp as being in Pacific Time.
  return moment.tz(timestamp, 'America/Los_Angeles');
}

function Big(props: { children: React.ReactNode }) {
  return <div style={{
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  }}>{props.children}</div>;
}

function Bigger(props: { children: React.ReactNode }) {
  return <div style={{
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  }}>{props.children}</div>;
}

function RunBar(props: {
  run: Run,
  place?: number,
  placeIcon?: string,
}) {
  const [hours, minutes, seconds] = props.run.time;
  // We return a row that will go into a table.
  return <tr>
    {props.place !== undefined && <td>{props.place}</td>}
    {props.placeIcon !== undefined && <td>{props.placeIcon}</td>}
    <td>{props.run.runner}</td>
    <td>{hours}h {minutes}m {seconds}s</td>
    <td><a href={props.run.link}>Video</a></td>
    <td className='tdCenter'><img src={props.run.chosenItem} style={{ width: 32, height: 32 }} /></td>
    <td style={{ opacity: 0.5 }}>{props.run.timestamp}</td>
  </tr>;
}

function timeAscending(a: Run, b: Run): number {
  return runToSeconds(a) - runToSeconds(b);
}

function deduplicate(runs: Run[]): Run[] {
  const runnersAlreadyIncluded = new Set<string>();
  const dedupedRuns: Run[] = [];
  for (const run of runs) {
    if (runnersAlreadyIncluded.has(run.runner)) {
      continue;
    }
    runnersAlreadyIncluded.add(run.runner);
    dedupedRuns.push(run);
  }
  return dedupedRuns;
}

function CountDown(props: {}) {
  // Force a re-render every second.
  const [now, setNow] = React.useState(moment.tz('America/Los_Angeles'));
  React.useEffect(() => {
    const interval = setInterval(() => {
      setNow(moment.tz('America/Los_Angeles'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const nextMidnight = now.clone().startOf('day').add(1, 'day');
  const timeUntilMidnight = nextMidnight.diff(now);
  const duration = moment.duration(timeUntilMidnight);
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();
  return <div style={{
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  }}>
    <span style={{ fontFamily: 'monospace' }}>
      {hours}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </span> until next reward
  </div>;
}

function App(props: {}) {
  const leaderboard = [];
  const sortedRuns = [...RUNS].sort(timeAscending);
  const runnersAlreadyIncluded = new Set<string>();
  let place = 0;
  for (const run of sortedRuns) {
    if (runnersAlreadyIncluded.has(run.runner)) {
      continue;
    }
    runnersAlreadyIncluded.add(run.runner);
    place++;
    let placeIcon = {
      1: '🥇',
      2: '🥈',
      3: '🥉',
    }[place] || '';
    leaderboard.push(<RunBar run={run} place={place} placeIcon={placeIcon} />);
  }

  let events: string[] = [];
  const rewardsAccrued = new Map<string, Rewards>();
  const accrueReward = (day: moment.Moment, runner: string, place: 1 | 2 | 3) => {
    if (!rewardsAccrued.has(runner)) {
      rewardsAccrued.set(runner, { dollars: 0, firsts: 0, seconds: 0, thirds: 0 });
    }
    const rewards = rewardsAccrued.get(runner)!;
    switch (place) {
      case 1:
        rewards.dollars += 6;
        rewards.firsts++;
        break;
      case 2:
        rewards.dollars += 2;
        rewards.seconds++;
        break;
      case 3:
        rewards.dollars += 1;
        rewards.thirds++;
        break;
      default:
        throw new Error(`Invalid place: ${place}`);
    }
    events.push(`${day}: ${runner} gets ${place} place, now has ${rewards.dollars} dollars`);
  }

  const actualToday = moment.tz('America/Los_Angeles').startOf('day');
  for (let virtualToday = COMPETITION_START_DAY.clone(); virtualToday.isBefore(actualToday); virtualToday.add(1, 'day')) {
    // Accrue rewards.
    let runsBefore = RUNS.filter(run => timestampToMoment(run.timestamp).isBefore(virtualToday));
    runsBefore = deduplicate(runsBefore.sort(timeAscending));
    for (const place of [1, 2, 3]) {
      if (runsBefore.length >= place) {
        accrueReward(virtualToday, runsBefore[place - 1].runner, place as any);
      }
    }
  }

  const topRewardedPlayers = [...rewardsAccrued.entries()].sort((a, b) => b[1].dollars - a[1].dollars);

  const svgContents = [];
  const maxTime = Math.max(...RUNS.map(run => runToSeconds(run)));
  const firstRunUnix = timestampToMoment(RUNS[0].timestamp).unix();
  const now = moment.tz('America/Los_Angeles');
  const tomorrowUnix = now.unix() + 24 * 3600;
  function unixToX(unix: number): number {
    return 800 * (unix - firstRunUnix) / (tomorrowUnix - firstRunUnix);
  }
  function secondsToY(seconds: number): number {
    return 600 * (1 - (seconds / maxTime));
  }
  function runSpot(run: Run): [number, number] {
    const runUnix = timestampToMoment(run.timestamp).unix();
    return [unixToX(runUnix), secondsToY(runToSeconds(run))];
  }
  // Draw a vertical dashed line for each midnight.
  const showCutoff = moment.tz('America/Los_Angeles');
  showCutoff.add(1, 'day');
  let first = true;
  for (let day = COMPETITION_START_DAY.clone(); day.isBefore(showCutoff); day.add(1, 'day')) {
    const time = day.unix();
    const x = unixToX(time);
    svgContents.push(<line x1={x} y1={0} x2={x} y2={600} stroke='white' strokeWidth={1} strokeDasharray='5,5' opacity={0.5} />);
    // Put the day number at the bottom.
    svgContents.push(<text x={x} y={600} fill='white' textAnchor='middle' fontSize={12} dy={15}>
      {first ? '(No rewards)' : day.format('MMM Do')}
    </text>);
    first = false;
  }
  // Draw a horizontal dashed line for each hour.
  for (const [hours, minutes, opacity] of [
    [0, 0, 1.0], [0, 15, 0.5], [0, 30, 0.5], [0, 45, 0.5],
    [1, 0, 1.0], [1, 15, 0.5], [1, 30, 0.5], [1, 45, 0.5],
    [2, 0, 1.0],
  ]) {
    const seconds = hours * 3600 + minutes * 60;
    const y = secondsToY(seconds);
    svgContents.push(<line x1={-15} y1={y} x2={800} y2={y} stroke='white' strokeWidth={1} strokeDasharray='5,5' opacity={0.5 * opacity} />);
    // Put the hour number at the left.
    svgContents.push(<text x={-15} y={y} fill='white' textAnchor='end' fontSize={12} dx={-5} dy={5} opacity={opacity}>
      {hours}:{`${minutes}`.padStart(2, '0')}:00
    </text>);
  }
  // Draw a vertical red line for right now.
  const nowX = unixToX(now.unix());
  svgContents.push(<line x1={nowX} y1={0} x2={nowX} y2={600} stroke='red' strokeWidth={1} />);
  // We draw a progression for each runner.
  let colorIndex = 0;
  for (let pair of topRewardedPlayers) {
    const [runner, rewards] = pair;
    let runsByPlayer = RUNS.filter(run => run.runner === runner);
    let lastPos: [number, number] | null = null;
    for (const run of runsByPlayer) {
      const [x, y] = runSpot(run);
      svgContents.push(<circle cx={x} cy={y} r={5} fill={COLORS[colorIndex]} />);
      if (lastPos !== null) {
        const [lastX, lastY] = lastPos;
        svgContents.push(<line x1={lastX} y1={lastY} x2={x} y2={lastY} stroke={COLORS[colorIndex]} strokeWidth={2} />);
        svgContents.push(<line x1={x} y1={lastY} x2={x} y2={y} stroke={COLORS[colorIndex]} strokeWidth={2} />);
      }
      lastPos = [x, y];
    }
    // Put a name marker at the end.
    const [x, y] = lastPos!;
    svgContents.push(<text x={x + 5} y={y + 5} fill={COLORS[colorIndex]}>{runner}</text>);
    colorIndex++;
    colorIndex %= COLORS.length;
  }

  return <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    //justifyContent: 'center',
    //height: '100vh',
  }}>
    <h1>Factorio Mod Run</h1>
    <p style={{
      width: 600,
      border: '1px solid black',
      borderRadius: 5,
      padding: 10,
      backgroundColor: '#0f0f1a',
    }}>
      <Big>Speedrunning competition ending November 30th</Big>
      How quickly can you complete an any% speedrun of Factorio if you get one magic chest that contains infinite of one item of your choice?
      More specific instructions on <a href="https://twitter.com/ptrschmdtnlsn/status/1713710162996060309">Twitter</a>.
      To submit a run, please post <a href="https://www.speedrun.com/factorio/forums/2oxe1">here</a>, post in the Team Steelaxe discord, or reply to the tweet.
    </p>
    <p style={{
      width: 600,
      border: '1px solid black',
      borderRadius: 5,
      padding: 10,
      marginTop: 20,
      backgroundColor: '#0f0f1a',
    }}>
      <Big>Prizes</Big>
      <ul>
        <li>1st place: $250</li>
        <li>2nd place: $100</li>
        <li>3rd place: $50</li>
      </ul>
      In addition to the above prizes, there are nightly prizes that accrute at midnight in my timezone (Pacific Time):
      <ul>
        <li>At each midnight, the current 1st place run gets $6</li>
        <li>At each midnight, the current 2nd place run gets $2</li>
        <li>At each midnight, the current 3rd place run gets $1</li>
      </ul>
    </p>
    <Bigger>Current Leaderboard</Bigger>
    <table style={{
      width: 600,
      border: '1px solid black',
      borderRadius: 5,
      padding: 10,
      marginBottom: 20,
      backgroundColor: '#0f0f1a',
    }}>
      <thead>
        <tr>
          <th></th>
          <th></th>
          <th>Runner</th>
          <th>Run time</th>
          <th></th>
          <th>Chosen item</th>
          <th>Submitted at</th>
        </tr>
      </thead>
      <tbody>
        {leaderboard}
      </tbody>
    </table>

    <Bigger>Rewards Accrued</Bigger>
    <table style={{
      width: 600,
      border: '1px solid black',
      borderRadius: 5,
      padding: 10,
      marginBottom: 20,
      backgroundColor: '#0f0f1a',
    }}>
      <thead>
        <tr>
          <th>Runner</th>
          <th>Prize money</th>
          <th>🥇 Days ($6/day)</th>
          <th>🥈 Days ($2/day)</th>
          <th>🥉 Days ($1/day)</th>
        </tr>
      </thead>
      <tbody>
        {topRewardedPlayers.map((pair: [string, Rewards]) => {
          const [runner, rewards] = pair;
          return <tr>
            <td>{runner}</td>
            <td className='tdCenter'>${rewards.dollars}</td>
            <td className='tdCenter'>{rewards.firsts}</td>
            <td className='tdCenter'>{rewards.seconds}</td>
            <td className='tdCenter'>{rewards.thirds}</td>
          </tr>;
        })}
      </tbody>
    </table>

    <Bigger>Progression</Bigger>
    {/* We draw an 800x600 SVG */}
    <svg width={800} height={600} viewBox='-50 -50 875 700' style={{
      border: '1px solid black',
      borderRadius: 5,
      marginBottom: 20,
      backgroundColor: '#0f0f1a',
    }}>
      {/* We draw a rectangle for each run */}
      {svgContents}
    </svg>
    <CountDown />

    <Bigger>All Submissions</Bigger>
    <table style={{
      width: 600,
      border: '1px solid black',
      borderRadius: 5,
      padding: 10,
      backgroundColor: '#0f0f1a',
    }}>
      <thead>
        <tr>
          <th>Runner</th>
          <th>Run time</th>
          <th></th>
          <th>Chosen item</th>
          <th>Submitted at</th>
        </tr>
      </thead>
      <tbody>
        {RUNS.map(run => <RunBar run={run} />)}
      </tbody>
    </table>

    {/*events.map(event => <pre>{event}</pre>)*/}
  </div>;
}

ReactDOM.render(
  <App />,
  document.getElementById('root'),
);
