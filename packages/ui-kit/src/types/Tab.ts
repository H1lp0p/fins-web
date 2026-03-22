export interface Tab {
    id: string;
    label: string;
    /** Для семантики и открытия в новой вкладке; при клике по-прежнему вызывается onTabClick. */
    href?: string;
}