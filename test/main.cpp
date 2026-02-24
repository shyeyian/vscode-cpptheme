#include <string>

class animal
{
    public:
        void grow ( );
        virtual std::string shout ( );
};

class dog
    : public animal
{
    public:
        virtual std::string shout ( ) override;
};

class cat
    : public animal
{
    public:
        virtual std::string shout ( ) override;
};



void animal::grow ( )
{
    shout();
}

std::string animal::shout ( )
{
    return "...";
}

std::string dog::shout ( )
{
    return "wolf";
}

std::string cat::shout ( )
{
    return "meow";
}



int main ( )
{
    static_cast<animal&&>(cat()).shout();
    animal().grow();
}