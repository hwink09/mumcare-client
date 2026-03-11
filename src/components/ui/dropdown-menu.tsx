import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuContextType {
    onClose: () => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | null>(null);

interface DropdownMenuProps {
    children: React.ReactNode;
    trigger: React.ReactNode;
    align?: "start" | "end" | "center";
}

export function DropdownMenu({ children, trigger, align = "end" }: DropdownMenuProps) {
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest("[data-dropdown-menu]")) {
                setOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [open]);

    const closeMenu = () => setOpen(false);

    return (
        <DropdownMenuContext.Provider value={{ onClose: closeMenu }}>
            <div className="relative" data-dropdown-menu>
                <div onClick={() => setOpen(!open)}>{trigger}</div>
                {open && (
                    <div
                        className={cn(
                            "absolute z-50 mt-2 min-w-[200px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
                            align === "end" && "right-0",
                            align === "start" && "left-0",
                            align === "center" && "left-1/2 -translate-x-1/2"
                        )}
                    >
                        {children}
                    </div>
                )}
            </div>
        </DropdownMenuContext.Provider>
    );
}

interface DropdownMenuItemProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

export function DropdownMenuItem({ children, onClick, className }: DropdownMenuItemProps) {
    const context = React.useContext(DropdownMenuContext);

    const handleClick = () => {
        onClick?.();
        context?.onClose();
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                className
            )}
        >
            {children}
        </div>
    );
}

export function DropdownMenuSeparator() {
    return <div className="my-1 h-px bg-border" />;
}
