import type { Dispatch, SetStateAction } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import ProfileCard from "./ProfileCard";
import { useAuthStore } from "../../stores/useAuthStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import PrivacySettings from "./PrivacySetting";
import PreferencesForm from "./PreferencesForm";
import PersonalInfoForm from "./PersonalInfoForm";

interface IProfileDialog {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const ProfileDialog = ({ open, setOpen }: IProfileDialog) => {
    const { user } = useAuthStore();

    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
        >
            <DialogContent className="overflow-y-auto p-0 bg-transparent border-0 shadow-2-xl">
                <div className="bg-gradient-glass">
                    <div className="max-w-4xl mx-auto p-4">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-2-xl font-bold text-foreground">
                                Profile & Setting
                            </DialogTitle>
                        </DialogHeader>

                        <ProfileCard user={user}/>

                        <Tabs
                            defaultValue="personal"
                            className="my-4"
                        >
                            <TabsList className="grid w-full grid-cols-3 glass-light">
                                <TabsTrigger
                                    value="personal"
                                    className="data-[state=active]:glass-strong"
                                >Account</TabsTrigger>

                                <TabsTrigger
                                    value="preferences"
                                    className="data-[state=active]:glass-strong"
                                >Display</TabsTrigger>

                                <TabsTrigger
                                    value="privacy"
                                    className="data-[state=active]:glass-strong"
                                >Security</TabsTrigger>
                            </TabsList>

                            <TabsContent value="personal">
                                <PersonalInfoForm userInfo={user} />
                            </TabsContent>

                            <TabsContent value="preferences">
                                <PreferencesForm />
                            </TabsContent>

                            <TabsContent value="privacy">
                                <PrivacySettings />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ProfileDialog;