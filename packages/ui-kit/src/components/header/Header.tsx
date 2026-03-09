import type { Tab } from "../../types/Tab";
import { Logo } from "../logo/Logo";
import { TabList } from "../tabs/TabList";
import "./header.css";

interface HeaderProps {
    tabs: Tab[];
    activeTab: Tab;
    onTabClick: (tab: Tab) => void;
    trailingContent?: React.ReactNode;
}

export function Header({
    tabs, 
    activeTab, 
    onTabClick, 
    trailingContent = undefined 
}: HeaderProps) {
    return (
        <div className="header ph-max">
            <Logo textStyle="text-giant"/>
            
            <TabList 
                tabs={tabs} 
                activeTab={activeTab} 
                onTabClick={onTabClick} 
                className="ph-max pv-max"
            />
            
            <div className="trailing-content">
                {trailingContent}
            </div>
        </div>
    );
}