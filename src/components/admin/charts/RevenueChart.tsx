import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const data = [
  { 
    month: "2025-01", 
    totalRevenue: 15420000,
    platformFee: 1542000,
    artistPayouts: 10794000,
    investorReturns: 3084000
  },
  { 
    month: "2025-02", 
    totalRevenue: 18750000,
    platformFee: 1875000,
    artistPayouts: 13125000,
    investorReturns: 3750000
  },
  { 
    month: "2025-03", 
    totalRevenue: 23100000,
    platformFee: 2310000,
    artistPayouts: 16170000,
    investorReturns: 4620000
  },
  { 
    month: "2025-04", 
    totalRevenue: 28500000,
    platformFee: 2850000,
    artistPayouts: 19950000,
    investorReturns: 5700000
  },
  { 
    month: "2025-05", 
    totalRevenue: 32800000,
    platformFee: 3280000,
    artistPayouts: 22960000,
    investorReturns: 6560000
  },
  { 
    month: "2025-06", 
    totalRevenue: 38200000,
    platformFee: 3820000,
    artistPayouts: 26740000,
    investorReturns: 7640000
  },
  { 
    month: "2025-07", 
    totalRevenue: 42500000,
    platformFee: 4250000,
    artistPayouts: 29750000,
    investorReturns: 8500000
  },
  { 
    month: "2025-08", 
    totalRevenue: 48900000,
    platformFee: 4890000,
    artistPayouts: 34230000,
    investorReturns: 9780000
  },
];

export function RevenueChart() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>수익 분배 현황</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.slice(-2)}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `₩${(value / 1000000).toFixed(0)}M`}
            />
            <Tooltip 
              labelFormatter={(value) => `${value}월`}
              formatter={(value, name) => [
                `₩${(Number(value) / 1000000).toFixed(1)}M`, 
                name === 'totalRevenue' ? '총 매출' :
                name === 'platformFee' ? '플랫폼 수수료' :
                name === 'artistPayouts' ? '아티스트 정산' : '투자자 수익'
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="totalRevenue" 
              stackId="1"
              stroke="var(--color-chart-1)" 
              fill="var(--color-chart-1)"
              fillOpacity={0.3}
            />
            <Area 
              type="monotone" 
              dataKey="artistPayouts" 
              stackId="2"
              stroke="var(--color-chart-2)" 
              fill="var(--color-chart-2)"
              fillOpacity={0.3}
            />
            <Area 
              type="monotone" 
              dataKey="investorReturns" 
              stackId="3"
              stroke="var(--color-chart-3)" 
              fill="var(--color-chart-3)"
              fillOpacity={0.3}
            />
            <Area 
              type="monotone" 
              dataKey="platformFee" 
              stackId="4"
              stroke="var(--color-chart-5)" 
              fill="var(--color-chart-5)"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}