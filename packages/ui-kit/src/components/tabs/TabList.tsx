import {type Tab} from "../../types/Tab";
import type { TextStyleType } from "../../types/textStyleType";
import "./tablist.css";

interface TabListProps {
    tabs: Tab[];
    activeTab: Tab;
    onTabClick: (tab: Tab) => void;
    textClassName?: TextStyleType;
    className?: string;
}

export function TabList({ tabs, activeTab, onTabClick, textClassName = "text-title", className = "" }: TabListProps) {
    
    const handleTabClick = (tab: Tab) => {
        onTabClick(tab);
    };

    return (
        <div className={`tab-list ${className}`}>
            {tabs.map((tab, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center", gap: "var(--fins-min-gap)" }}>
                    <span
                        className={`tab-item ${textClassName}`} 
                        onClick={() => handleTabClick(tab)}
                        data-active={tab.id === activeTab.id}
                    >
                        {tab.label}
                    </span>
                    {index < tabs.length - 1 && (
                        <span className={`color-info ${textClassName}`}>/</span>
                    )}
                </div>
            ))}
        </div>
    );
}