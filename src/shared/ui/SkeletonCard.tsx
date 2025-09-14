import * as React from "react"
import { Card, CardContent, CardHeader } from "./Card"

export function SkeletonCard() {
    return (
        <Card>
            <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-4/5" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/5" />
                </div>
            </CardContent>
        </Card>
    )
}