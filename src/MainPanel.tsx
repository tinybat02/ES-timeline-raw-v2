import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/data';
import { PanelOptions, Buffer } from 'types';
import { processDataES } from './util/process';
import { ResponsiveLine } from '@nivo/line';

interface Props extends PanelProps<PanelOptions> {}
interface State {
  data: Array<{ id: string; data: Array<{ x: string; y: number }> }> | null;
  loading: boolean;
  hashvendor: Array<string>;
}

export class MainPanel extends PureComponent<Props, State> {
  state: State = {
    data: null,
    loading: false,
    hashvendor: [],
  };

  componentDidMount() {
    if (this.props.data.series.length > 0) {
      const { buffer } = this.props.data.series[0].fields[0].values as Buffer;
      const { data, hashvendor } = processDataES(buffer);
      this.setState({ data, hashvendor, loading: false });
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.data.series[0] !== this.props.data.series[0]) {
      this.setState({ data: null, hashvendor: [], loading: true });
      if (this.props.data.series.length > 0) {
        const { buffer } = this.props.data.series[0].fields[0].values as Buffer;
        const { data, hashvendor } = processDataES(buffer);
        setTimeout(() => {
          this.setState({ data, hashvendor, loading: false });
        }, 1000);
      }
    }
  }

  render() {
    const { width, height } = this.props;
    const { data, loading, hashvendor } = this.state;
    if (!data && loading) {
      return <div>Loading...</div>;
    }

    if (!data && !loading) {
      return <div>No Data</div>;
    }

    if (data) {
      return (
        <div
          style={{
            width,
            height,
          }}
        >
          <select style={{ marginLeft: 60, width: 250 }}>
            {hashvendor.map(hash => (
              <option key={hash}>{hash}</option>
            ))}
          </select>
          <ResponsiveLine
            data={data}
            margin={{ top: 20, right: 20, bottom: 60, left: 80 }}
            xScale={{
              type: 'time',
              format: '%Y-%m-%dT%H:%M:%S',
              useUTC: false,
              // precision: 'day',
            }}
            xFormat="time:%Y-%m-%dT%H:%M:%S"
            yScale={{
              type: 'linear',
              stacked: false,
            }}
            axisLeft={{
              legend: 'linear scale',
              tickValues: 10,
              legendOffset: 12,
            }}
            axisBottom={{
              format: '%H:%M',
              tickValues: 10,
              legend: 'time scale',
              legendOffset: -12,
            }}
            // curve={select('curve', curveOptions, 'monotoneX')}
            // enablePointLabel={true}
            // pointSymbol={CustomSymbol}
            pointSize={9}
            pointBorderWidth={1}
            pointBorderColor={{
              from: 'color',
              modifiers: [['darker', 0.3]],
            }}
            useMesh={true}
            enableSlices="y"
          />
        </div>
      );
    }
    return <div></div>;
  }
}
