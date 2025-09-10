"use client"

import React from "react";
import { Button } from "@/components/ui/button";

interface StartGameButtonProps {
  onClick?: () => void;
}

const StartGameButton: React.FC<StartGameButtonProps> = ({ onClick }) => {
  return (
    <Button onClick={onClick}>
      Start Game
    </Button>
  );
};

export default StartGameButton;
