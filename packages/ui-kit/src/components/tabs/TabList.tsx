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
    
    const handleTabActivate = (tab: Tab) => {
        onTabClick(tab);
    };

    return (
        <div className={`tab-list ${className}`}>
            {tabs.map((tab, index) => (
                <div key={tab.id} style={{ display: "flex", alignItems: "center", gap: "var(--fins-min-gap)" }}>
                    <a
                        href={tab.href ?? "#"}
                        className={`tab-item ${textClassName}`}
                        data-active={tab.id === activeTab.id}
                        onClick={(e) => {
                            if (
                                e.button !== 0 ||
                                e.metaKey ||
                                e.ctrlKey ||
                                e.shiftKey ||
                                e.altKey
                            ) {
                                return;
                            }
                            e.preventDefault();
                            handleTabActivate(tab);
                        }}
                    >
                        {tab.label}
                    </a>
                    {index < tabs.length - 1 && (
                        <span className={`color-info ${textClassName}`}>/</span>
                    )}
                </div>
            ))}
        </div>
    );
}