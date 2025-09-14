import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "2025-01", users: 120, artists: 25 },
  { month: "2025-02", users: 180, artists: 32 },
  { month: "2025-03", users: 240, artists: 45 },
  { month: "2025-04", users: 320, artists: 58 },
  { month: "2025-05", users: 420, artists: 72 },
  { month: "2025-06", users: 580, artists: 89 },
  { month: "2025-07", users: 720, artists: 105 },
  { month: "2025-08", users: 850, artists: 128 },
];

export function UserGrowthChart() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>사용자 증가 추이</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
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
                name === 'users' ? '총 사용자' : '아티스트'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="users" 
              stroke="var(--color-chart-1)" 
              strokeWidth={2}
              dot={{ fill: "var(--color-chart-1)", strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="artists" 
              stroke="var(--color-chart-2)" 
              strokeWidth={2}
              dot={{ fill: "var(--color-chart-2)", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}