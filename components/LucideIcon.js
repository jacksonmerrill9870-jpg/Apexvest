import { 
  Activity, ArrowDown, ArrowDownLeft, ArrowLeft, ArrowLeftRight, ArrowRightLeft, ArrowUpRight, 
  BarChart2, BarChart3, Bell, Bitcoin, BookOpen, Building, Check, CheckCircle, ChevronDown, 
  Clock, Coins, Compass, Copy, Cpu, CreditCard, DollarSign, Droplet, Eye, FileText, Gift, 
  Globe, GraduationCap, Hash, HelpCircle, Info, Landmark, Layers, LayoutDashboard, List, 
  Lock, LogOut, Mail, Menu, MinusCircle, Monitor, Percent, Phone, Plus, PlusCircle, Search, 
  Settings, Shield, ShoppingBag, Sliders, Terminal, Trash2, TrendingUp, Upload, User, 
  UserCheck, Users, Wallet, X 
} from "lucide-react";

const iconMap = {
  Activity, ArrowDown, ArrowDownLeft, ArrowLeft, ArrowLeftRight, ArrowRightLeft, ArrowUpRight, 
  BarChart2, BarChart3, Bell, Bitcoin, BookOpen, Building, Check, CheckCircle, ChevronDown, 
  Clock, Coins, Compass, Copy, Cpu, CreditCard, DollarSign, Droplet, Eye, FileText, Gift, 
  Globe, GraduationCap, Hash, HelpCircle, Info, Landmark, Layers, LayoutDashboard, List, 
  Lock, LogOut, Mail, Menu, MinusCircle, Monitor, Percent, Phone, Plus, PlusCircle, Search, 
  Settings, Shield, ShoppingBag, Sliders, Terminal, Trash2, TrendingUp, Upload, User, 
  UserCheck, Users, Wallet, X
};

const kebabToPascal = (str) => {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
};

export default function LucideIcon({ name, className = "", style = {} }) {
  const pascalName = kebabToPascal(name);
  const IconComponent = iconMap[pascalName];

  if (!IconComponent) {
    console.warn(`Icon "${name}" (Pascal: ${pascalName}) not found in mapped icons`);
    return null;
  }

  return <IconComponent className={className} style={style} />;
}
