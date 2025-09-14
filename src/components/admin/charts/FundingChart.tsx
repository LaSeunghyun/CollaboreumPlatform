import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "2025-01", successful: 8, failed: 3, total: 15420000 },
  { month: "2025-02", successful: 12, failed: 2, total: 18750000 },
  { month: "2025-03", successful: 15, failed: 4, total: 23100000 },
  { month: "2025-04", successful: 18, failed: 3, total: 28500000 },
  { month: "2025-05", successful: 22, failed: 5, total: 32800000 },
  { month: "2025-06", successful: 25, failed: 4, total: 38200000 },
  { month: "2025-07", successful: 28, failed: 6, total: 42500000 },
  { month: "2025-08", successful: 32, failed: 7, total: 48900000 },
];

export function FundingChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>펀딩 프로젝트 현황</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.slice(-2)}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              labelFormatter={(value) => `${value}월`}
              formatter={(value, name) => [
                value, 
                name === 'successful' ? '성공' : '실패'
              ]}
            />
            <Bar 
              dataKey="successful" 
              fill="var(--color-chart-2)" 
              name="성공"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="failed" 
              fill="var(--color-chart-4)" 
              name="실패"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}